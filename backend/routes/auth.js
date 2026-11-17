const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authRequired } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { verificationEmail, sendEmail } = require('../mailer');

const router = express.Router();

function emailVerificationEnabled() {
  return String(process.env.EMAIL_VERIFICATION_ENABLED).toLowerCase() === 'true';
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified !== false };
}

const hashToken = t => crypto.createHash('sha256').update(t).digest('hex');

// Creates a one-time 6-digit verification code (valid 10 minutes). Only its hash is stored.
function issueVerification(user) {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  user.verifyCodeHash = hashToken(code);
  delete user.verifyTokenHash;
  user.verifyExpires = Date.now() + 10 * 60 * 1000;
  user.verifyLastSentAt = Date.now();
  return code;
}

async function mailVerification(user, code) {
  const mail = verificationEmail(user.name, code);
  return sendEmail({ to: user.email, ...mail });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const data = db.read();
  if (data.users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // TODO: re-enable email verification once domain is verified in Resend.
  if (!emailVerificationEnabled()) {
    const user = {
      id: 'u-' + crypto.randomBytes(4).toString('hex'),
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'student',
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
    db.write(data);
    return res.status(201).json({
      token: makeToken(user),
      user: publicUser(user),
      requiresVerification: false,
      emailVerificationEnabled: false,
      emailDelivery: null,
    });
  }

  // TODO: re-enable email verification once domain is verified in Resend.
  const user = {
    id: 'u-' + crypto.randomBytes(4).toString('hex'),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'student',
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
  const verifyCode = issueVerification(user);

  data.users.push(user);
  db.write(data);
  try {
    const emailDelivery = await mailVerification(user, verifyCode);
    return res.status(201).json({ token: makeToken(user), user: publicUser(user), requiresVerification: true, emailVerificationEnabled: true, emailDelivery });
  } catch (err) {
    console.error('Email failed:', err.message);
    return res.status(502).json({
      token: makeToken(user),
      user: publicUser(user),
      requiresVerification: true,
      emailVerificationEnabled: true,
      emailDelivery: { sent: false },
      error: `Account created, but the verification email could not be sent. ${err.message}`,
    });
  }
});

// POST /api/auth/verify-email  { email, code } or { token } (legacy link)
router.post('/verify-email', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), (req, res) => {
  // TODO: re-enable email verification once domain is verified in Resend.
  if (!emailVerificationEnabled()) {
    return res.status(400).json({ error: 'Email verification is currently disabled.' });
  }
  const token = String(req.body.token || '');
  const code = String(req.body.code || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const data = db.read();

  let user;
  if (/^\d{6}$/.test(code)) {
    if (!email) return res.status(400).json({ error: 'Please enter your email address and verification code.' });
    user = data.users.find(u => u.email === email && u.verifyCodeHash && u.verifyCodeHash === hashToken(code));
  } else if (/^[0-9a-f]{64}$/.test(token)) {
    user = data.users.find(u => u.verifyTokenHash && u.verifyTokenHash === hashToken(token));
  } else {
    return res.status(400).json({ error: 'Please enter the 6-digit verification code sent to your email.' });
  }

  if (!user) return res.status(400).json({ error: 'This code is invalid or has already been used. Request a new one from your account.' });
  if (Date.now() > user.verifyExpires) return res.status(400).json({ error: 'This code has expired. Request a new one from your account.' });
  user.emailVerified = true;
  delete user.verifyCodeHash;
  delete user.verifyTokenHash;
  delete user.verifyExpires;
  db.write(data);
  res.json({ ok: true, user: publicUser(user) });
});

// POST /api/auth/resend-verification  (signed-in students, one email per minute)
router.post('/resend-verification', authRequired, async (req, res) => {
  // TODO: re-enable email verification once domain is verified in Resend.
  if (!emailVerificationEnabled()) {
    return res.status(400).json({ error: 'Email verification is currently disabled.' });
  }
  const data = db.read();
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });
  if (user.emailVerified !== false) return res.json({ ok: true, alreadyVerified: true });
  const wait = 60000 - (Date.now() - (user.verifyLastSentAt || 0));
  if (wait > 0) return res.status(429).json({ error: `Please wait ${Math.ceil(wait / 1000)} seconds before asking for another email.` });
  const code = issueVerification(user);
  db.write(data);
  try {
    const emailDelivery = await mailVerification(user, code);
    return res.json({ ok: true, emailDelivery });
  } catch (err) {
    console.error('Email failed:', err.message);
    return res.status(502).json({ error: `The verification email could not be sent. ${err.message}` });
  }
});

// POST /api/auth/reset-password  { token, password }
router.post('/reset-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/^[0-9a-f]{64}$/.test(token)) return res.status(400).json({ error: 'This reset link is not valid.' });
  const data = db.read();
  const user = data.users.find(u => u.resetTokenHash && u.resetTokenHash === hashToken(token));
  if (!user || Date.now() > user.resetExpires) return res.status(400).json({ error: 'This link is invalid, expired or already used. Please request a new one.' });
  user.passwordHash = bcrypt.hashSync(password, 10);
  user.emailVerified = true; // they received an email at this address
  delete user.resetTokenHash;
  delete user.resetExpires;
  db.write(data);
  res.json({ ok: true });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const data = db.read();
  const user = data.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  if (user.disabled) {
    return res.status(403).json({ error: 'This account has been disabled. Please contact the school.' });
  }

  let emailDelivery = null;
  // TODO: re-enable email verification once domain is verified in Resend.
  if (emailVerificationEnabled() && user.emailVerified === false) {
    const wait = 60000 - (Date.now() - (user.verifyLastSentAt || 0));
    if (wait <= 0) {
      const code = issueVerification(user);
      db.write(data);
      try {
        emailDelivery = await mailVerification(user, code);
      } catch (err) {
        console.error('Email failed:', err.message);
        return res.status(502).json({
          token: makeToken(user),
          user: publicUser(user),
          requiresVerification: true,
          emailVerificationEnabled: true,
          emailDelivery: { sent: false },
          error: `Signed in, but the verification email could not be sent. ${err.message}`,
        });
      }
    } else {
      emailDelivery = { sent: false, throttled: true };
    }
  }

  return res.json({
    token: makeToken(user),
    user: publicUser(user),
    requiresVerification: emailVerificationEnabled() && user.emailVerified === false,
    emailVerificationEnabled: emailVerificationEnabled(),
    emailDelivery,
  });
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/change-password   Body: { currentPassword, newPassword }
router.post('/change-password', authRequired, (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');

  const data = db.read();
  const user = data.users.find(u => u.id === req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: 'Your current password is not correct' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'The new password must be at least 8 characters' });
  }
  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  db.write(data);
  res.json({ message: 'Password changed' });
});

// PATCH /api/auth/profile   Body: { name }
// Certificates already issued keep the name they were signed with.
router.patch('/profile', authRequired, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80);
  if (name.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name' });
  }
  const data = db.read();
  const user = data.users.find(u => u.id === req.user.id);
  user.name = name;
  db.write(data);
  res.json({ user: publicUser(user) });
});

module.exports = router;