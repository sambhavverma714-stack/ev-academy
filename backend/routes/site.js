// Public website features: contact form, password-reset requests, announcements,
// course reviews, and the admin tools that manage them.
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { ratingSummary, publicName } = require('../reviews');
const { sendEmail, resetEmail, appUrl } = require('../mailer');

const router = express.Router();
const admin = [authRequired, adminOnly];
const text = (value, max) => String(value ?? '').trim().slice(0, max);
const newest = (a, b) => b.createdAt.localeCompare(a.createdAt);

// Same rule as the course routes: admins, free courses, or a paid enrolment
function hasAccess(data, user, course) {
  if (user.role === 'admin') return true;
  if (!course.price) return true;
  return data.payments.some(p => p.userId === user.id && p.courseId === course.id && p.status === 'paid');
}

function newMessage(data, fields) {
  const message = {
    id: 'm-' + crypto.randomBytes(4).toString('hex'),
    type: fields.type,
    name: fields.name,
    email: fields.email,
    subject: fields.subject,
    message: fields.message,
    createdAt: new Date().toISOString(),
    handled: false
  };
  data.messages.push(message);
  return message;
}

// ---------- Contact form and password-reset requests (public) ----------
const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 6 });
const resetLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 6 });

// POST /api/site/contact   Body: { name, email, subject, message }
router.post('/contact', contactLimit, (req, res) => {
  const name = text(req.body.name, 80);
  const email = text(req.body.email, 120).toLowerCase();
  const subject = text(req.body.subject, 120) || 'General question';
  const message = text(req.body.message, 2000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (message.length < 10) {
    return res.status(400).json({ error: 'Please write a little more so we can help (at least 10 characters)' });
  }

  const data = db.read();
  newMessage(data, { type: 'contact', name, email, subject, message });
  db.write(data);
  if (process.env.CONTACT_EMAIL) {
    const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    sendEmail({
      to: process.env.CONTACT_EMAIL,
      subject: 'New contact message: ' + subject,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`
    }).catch(err => console.error('Email failed:', err.message));
  }
  res.status(201).json({ message: 'Thank you. We will reply by email soon.' });
});

// POST /api/site/password-reset-request   Body: { email }
router.post('/password-reset-request', resetLimit, async (req, res) => {
  const email = text(req.body.email, 120).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  // TODO: re-enable email verification once domain is verified in Resend.
  if (String(process.env.EMAIL_VERIFICATION_ENABLED).toLowerCase() !== 'true') {
    return res.status(503).json({ error: 'Password reset by email is temporarily unavailable.' });
  }
  const data = db.read();
  const user = data.users.find(u => u.email === email && u.role === 'student');
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetExpires = Date.now() + 60 * 60 * 1000;
    db.write(data);
    const mail = resetEmail(user.name, `${appUrl()}/reset-password?token=${token}`);
    try {
      await sendEmail({ to: user.email, ...mail });
    } catch (err) {
      console.error('Email failed:', err.message);
      return res.status(503).json({ error: 'Password reset by email is temporarily unavailable.' });
    }
  }
  res.json({ message: 'If an account exists for this email, we have sent a link to reset the password. Check your inbox.' });
});

// ---------- Announcements ----------
// GET /api/site/announcements  (public, newest five)
router.get('/announcements', (req, res) => {
  const announcements = [...db.read().announcements].sort(newest).slice(0, 5)
    .map(a => ({ id: a.id, title: a.title, body: a.body, createdAt: a.createdAt }));
  res.json({ announcements });
});

// ---------- Reviews ----------
function reviewView(data, r) {
  const course = data.courses.find(c => c.id === r.courseId);
  return {
    id: r.id,
    courseId: r.courseId,
    courseTitle: course ? course.title : 'Unknown course',
    name: publicName(r.userName),
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  };
}

// GET /api/site/reviews/featured  (public, for the home page)
router.get('/reviews/featured', (req, res) => {
  const data = db.read();
  const reviews = data.reviews
    .filter(r => r.rating >= 4 && r.comment)
    .sort(newest)
    .slice(0, 3)
    .map(r => reviewView(data, r));
  res.json({ reviews });
});

// GET /api/site/reviews/:courseId  (public)
router.get('/reviews/:courseId', (req, res) => {
  const data = db.read();
  if (!data.courses.some(c => c.id === req.params.courseId)) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const reviews = data.reviews
    .filter(r => r.courseId === req.params.courseId)
    .sort(newest)
    .slice(0, 50)
    .map(r => reviewView(data, r));
  res.json({ reviews, summary: ratingSummary(data, req.params.courseId) });
});

// POST /api/site/reviews/:courseId   Body: { rating: 1-5, comment }
// Students who can open the course may review it. One review each, which they can edit.
router.post('/reviews/:courseId', authRequired, (req, res) => {
  const data = db.read();
  const course = data.courses.find(c => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can leave reviews' });
  }
  if (!hasAccess(data, req.user, course)) {
    return res.status(402).json({ error: 'Enrol in this course before reviewing it' });
  }

  const rating = Number(req.body.rating);
  const comment = text(req.body.comment, 600);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars' });
  }

  let review = data.reviews.find(r => r.userId === req.user.id && r.courseId === course.id);
  if (review) {
    review.rating = rating;
    review.comment = comment;
    review.userName = req.user.name;
  } else {
    review = {
      id: 'r-' + crypto.randomBytes(4).toString('hex'),
      userId: req.user.id,
      userName: req.user.name,
      courseId: course.id,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    data.reviews.push(review);
  }
  db.write(data);
  res.status(201).json({ review: reviewView(data, review), summary: ratingSummary(data, course.id) });
});

// ---------- Admin: messages ----------
router.get('/admin/messages', ...admin, (req, res) => {
  const messages = [...db.read().messages].sort(newest);
  res.json({ messages, open: messages.filter(m => !m.handled).length });
});

router.patch('/admin/messages/:id', ...admin, (req, res) => {
  const data = db.read();
  const message = data.messages.find(m => m.id === req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  message.handled = !!req.body.handled;
  db.write(data);
  res.json({ message });
});

router.delete('/admin/messages/:id', ...admin, (req, res) => {
  const data = db.read();
  if (!data.messages.some(m => m.id === req.params.id)) {
    return res.status(404).json({ error: 'Message not found' });
  }
  data.messages = data.messages.filter(m => m.id !== req.params.id);
  db.write(data);
  res.json({ message: 'Message deleted' });
});

// ---------- Admin: announcements ----------
router.get('/admin/announcements', ...admin, (req, res) => {
  res.json({ announcements: [...db.read().announcements].sort(newest) });
});

router.post('/admin/announcements', ...admin, (req, res) => {
  const title = text(req.body.title, 100);
  const body = text(req.body.body, 1000);
  if (!title || !body) return res.status(400).json({ error: 'A title and a message are required' });
  const data = db.read();
  const announcement = {
    id: 'a-' + crypto.randomBytes(4).toString('hex'),
    title,
    body,
    createdAt: new Date().toISOString()
  };
  data.announcements.push(announcement);
  db.write(data);
  res.status(201).json({ announcement });
});

router.delete('/admin/announcements/:id', ...admin, (req, res) => {
  const data = db.read();
  if (!data.announcements.some(a => a.id === req.params.id)) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  data.announcements = data.announcements.filter(a => a.id !== req.params.id);
  db.write(data);
  res.json({ message: 'Announcement deleted' });
});

// ---------- Admin: reviews ----------
router.get('/admin/reviews', ...admin, (req, res) => {
  const data = db.read();
  res.json({ reviews: [...data.reviews].sort(newest).map(r => ({ ...reviewView(data, r), fullName: r.userName })) });
});

router.delete('/admin/reviews/:id', ...admin, (req, res) => {
  const data = db.read();
  if (!data.reviews.some(r => r.id === req.params.id)) {
    return res.status(404).json({ error: 'Review not found' });
  }
  data.reviews = data.reviews.filter(r => r.id !== req.params.id);
  db.write(data);
  res.json({ message: 'Review deleted' });
});

module.exports = router;
