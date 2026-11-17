const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// "razorpay" when both keys are set, otherwise "demo" (no real money is taken)
function paymentMode() {
  return process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'razorpay' : 'demo';
}

// Payment methods a student can choose. In Razorpay mode the choice opens that tab.
const METHODS = {
  upi: 'UPI',
  card: 'Debit or credit card',
  netbanking: 'Net banking',
  wallet: 'Wallet'
};

function findPaid(data, userId, courseId) {
  return data.payments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'paid');
}

function paymentView(data, p) {
  const course = data.courses.find(c => c.id === p.courseId);
  return {
    id: p.id,
    courseId: p.courseId,
    courseTitle: course ? course.title : 'Unknown course',
    amount: p.amount,
    status: p.status,
    method: p.method,
    paymentMethod: p.paymentMethod || null,
    createdAt: p.createdAt,
    paidAt: p.paidAt || null
  };
}

// Checks Razorpay's signature: HMAC-SHA256 of "orderId|paymentId" with the key secret
function validSignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// GET /api/payments/config
router.get('/config', (req, res) => {
  res.json({ mode: paymentMode(), keyId: process.env.RAZORPAY_KEY_ID || null, currency: 'INR', methods: METHODS });
});

// GET /api/payments/me
router.get('/me', authRequired, (req, res) => {
  const data = db.read();
  const payments = data.payments
    .filter(p => p.userId === req.user.id && p.status === 'paid')
    .map(p => paymentView(data, p));
  res.json({ payments });
});

// POST /api/payments/order   Body: { courseId }
router.post('/order', authRequired, async (req, res, next) => {
  try {
    const data = db.read();
    const payer = data.users.find(u => u.id === req.user.id);
    if (payer && payer.emailVerified === false) {
      return res.status(403).json({ error: 'Please verify your email address before buying a course. Check your inbox for the link.', code: 'EMAIL_NOT_VERIFIED' });
    }
    const course = data.courses.find(c => c.id === req.body.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.price) return res.status(400).json({ error: 'This course is free. No payment is needed.' });
    if (findPaid(data, req.user.id, course.id)) {
      return res.status(409).json({ error: 'You are already enrolled in this course' });
    }

    const paymentMethod = Object.keys(METHODS).includes(req.body.paymentMethod) ? req.body.paymentMethod : 'upi';
    const payment = {
      id: 'p-' + crypto.randomBytes(4).toString('hex'),
      userId: req.user.id,
      courseId: course.id,
      amount: course.price,
      status: 'created',
      method: paymentMode(),
      paymentMethod,
      orderId: null,
      createdAt: new Date().toISOString()
    };

    if (paymentMode() === 'razorpay') {
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + auth },
        body: JSON.stringify({ amount: course.price * 100, currency: 'INR', receipt: payment.id })
      });
      const order = await response.json();
      if (!response.ok || !order.id) {
        console.error('Razorpay order failed:', order);
        return res.status(502).json({ error: 'The payment service is not available. Please try again.' });
      }
      payment.orderId = order.id;
    } else {
      payment.orderId = 'demo_' + payment.id;
    }

    data.payments.push(payment);
    db.write(data);

    res.status(201).json({
      mode: paymentMode(),
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      paymentMethod,
      keyId: process.env.RAZORPAY_KEY_ID || null,
      courseTitle: course.title
    });
  } catch (err) {
    next(err);
  }
});

function markPaid(data, payment, extra = {}) {
  payment.status = 'paid';
  payment.paidAt = new Date().toISOString();
  Object.assign(payment, extra);
  // A student never needs two paid records for one course
  data.payments = data.payments.filter(
    p => !(p.userId === payment.userId && p.courseId === payment.courseId && p.status === 'created' && p.id !== payment.id)
  );
}

// POST /api/payments/verify   Body: { orderId, razorpayPaymentId, signature }
router.post('/verify', authRequired, (req, res) => {
  if (paymentMode() !== 'razorpay') {
    return res.status(400).json({ error: 'Online payments are not switched on' });
  }
  const { orderId, razorpayPaymentId, signature } = req.body;
  const data = db.read();
  const payment = data.payments.find(p => p.orderId === orderId && p.userId === req.user.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.status === 'paid') return res.json({ payment: paymentView(data, payment) });

  if (!validSignature(orderId, razorpayPaymentId, signature)) {
    return res.status(400).json({ error: 'The payment could not be confirmed. If money was taken, contact the school.' });
  }
  markPaid(data, payment, { razorpayPaymentId });
  db.write(data);
  res.json({ payment: paymentView(data, payment) });
});

// POST /api/payments/demo-confirm   Body: { paymentId }   (demo mode only)
router.post('/demo-confirm', authRequired, (req, res) => {
  if (paymentMode() !== 'demo') {
    return res.status(400).json({ error: 'Demo payments are switched off' });
  }
  const data = db.read();
  const payment = data.payments.find(p => p.id === req.body.paymentId && p.userId === req.user.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.status !== 'paid') {
    markPaid(data, payment);
    db.write(data);
  }
  res.json({ payment: paymentView(data, payment) });
});

module.exports = router;
module.exports.paymentView = paymentView;
