// Admin API. Every route here needs a logged-in admin.
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired, adminOnly);

// ---------- Admin profile ----------
// GET /api/admin/profile
router.get('/profile', (req, res) => {
  const data = db.read();
  const user = data.users.find(u => u.id === 'u-admin');
  if (!user) return res.status(404).json({ error: 'Admin not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// PATCH /api/admin/profile   Body: { name, password? }
router.patch('/profile', (req, res) => {
  const data = db.read();
  const user = data.users.find(u => u.id === 'u-admin');
  if (!user) return res.status(404).json({ error: 'Admin not found' });

  const name = String(req.body.name || '').trim().slice(0, 80);
  if (name.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name' });
  }
  user.name = name;

  // Handle password change if provided
  if (req.body.password) {
    const newPassword = String(req.body.password || '');
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'The new password must be at least 8 characters' });
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  db.write(data);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// ---------- Overview ----------
// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const data = db.read();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const paid = data.payments.filter(p => p.status === 'paid');
  const studentList = students(data);
  const upcoming = data.slots.filter(s => new Date(s.startsAt) > now);
  const upcomingIds = new Set(upcoming.map(s => s.id));

  const perCourse = data.courses.map(course => {
    const coursePaid = paid.filter(p => p.courseId === course.id);
    const records = data.progress.filter(p => p.courseId === course.id);
    const best = records.filter(r => r.attempts.length).map(r => Math.max(...r.attempts.map(a => a.score)));
    return {
      courseId: course.id,
      title: course.title,
      price: course.price,
      enrolled: coursePaid.length,
      started: records.filter(r => r.completedModules.length > 0).length,
      passed: records.filter(r => r.passed).length,
      averageBestScore: best.length ? Math.round(best.reduce((a, b) => a + b, 0) / best.length) : null,
      revenue: coursePaid.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
  });

  res.json({
    students: studentList.length,
    newStudentsThisWeek: studentList.filter(u => new Date(u.createdAt) >= weekAgo).length,
    enrolments: paid.length,
    revenue: paid.reduce((sum, p) => sum + (p.amount || 0), 0),
    certificates: data.certificates.filter(c => !c.revoked).length,
    upcomingSessions: upcoming.reduce((sum, s) => sum + s.capacity, 0),
    upcomingBookings: data.bookings.filter(b => upcomingIds.has(b.slotId)).length,
    perCourse
  });
});

// ---------- Students ----------
function studentRow(data, u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    disabled: !!u.disabled,
    createdAt: u.createdAt,
    enrolledCourses: data.payments.filter(p => p.userId === u.id && p.status === 'paid').length,
    certificates: data.certificates.filter(c => c.userId === u.id && !c.revoked).length,
    bookings: data.bookings.filter(b => b.userId === u.id).length
  };
}

router.get('/students', (req, res) => {
  const data = db.read();
  const search = String(req.query.search || '').trim().toLowerCase();
  const list = students(data)
    .filter(u => !search || u.name.toLowerCase().includes(search) || u.email.includes(search))
    .map(u => studentRow(data, u))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ students: list });
});

router.get('/students/:id', (req, res) => {
  const data = db.read();
  const user = students(data).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Student not found' });

  res.json({
    student: studentRow(data, user),
    courses: data.courses.map(course => {
      const record = data.progress.find(p => p.userId === user.id && p.courseId === course.id);
      return {
        courseId: course.id,
        title: course.title,
        enrolled: hasPaid(data, user.id, course.id),
        completedModules: record ? record.completedModules.length : 0,
        totalModules: course.modules.length,
        attempts: record ? record.attempts.length : 0,
        bestScore: bestScore(record),
        passed: record ? record.passed : false
      };
    }),
    payments: data.payments.filter(p => p.userId === user.id && p.status === 'paid').map(p => ({
      id: p.id, courseTitle: courseTitle(data, p.courseId), amount: p.amount, method: p.method, paidAt: p.paidAt
    })),
    certificates: data.certificates.filter(c => c.userId === user.id).map(c => ({
      id: c.id, courseTitle: c.courseTitle, issuedAt: c.issuedAt, revoked: !!c.revoked
    })),
    bookings: data.bookings.filter(b => b.userId === user.id).map(b => {
      const slot = data.slots.find(s => s.id === b.slotId);
      return { id: b.id, courseTitle: slot ? courseTitle(data, slot.courseId) : 'Removed session', startsAt: slot ? slot.startsAt : null };
    })
  });
});

// PATCH /api/admin/students/:id   Body: { disabled: true|false }
router.patch('/students/:id', (req, res) => {
  const data = db.read();
  const user = students(data).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Student not found' });
  user.disabled = !!req.body.disabled;
  db.write(data);
  res.json({ student: studentRow(data, user) });
});

// POST /api/admin/students/:id/reset-password   Body: { password }
router.post('/students/:id/reset-password', (req, res) => {
  const data = db.read();
  const user = students(data).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Student not found' });
  const password = String(req.body.password || '');
  if (password.length < 8) return res.status(400).json({ error: 'The password must be at least 8 characters' });
  user.passwordHash = bcrypt.hashSync(password, 10);
  db.write(data);
  res.json({ message: 'Password reset' });
});

// POST /api/admin/students/:id/enrol   Body: { courseId }   (free access given by the school)
router.post('/students/:id/enrol', (req, res) => {
  const data = db.read();
  const user = students(data).find(u => u.id === req.params.id);
  const course = data.courses.find(c => c.id === req.body.courseId);
  if (!user) return res.status(404).json({ error: 'Student not found' });
  if (!course) return res.status(400).json({ error: 'Choose a valid course' });
  if (hasPaid(data, user.id, course.id)) return res.status(409).json({ error: 'This student is already enrolled' });

  const now = new Date().toISOString();
  data.payments.push({
    id: 'p-' + crypto.randomBytes(4).toString('hex'),
    userId: user.id, courseId: course.id, amount: 0, status: 'paid',
    method: 'admin', orderId: null, createdAt: now, paidAt: now
  });
  db.write(data);
  res.status(201).json({ message: 'Student enrolled' });
});

// ---------- Lab sessions ----------

function slotAdminView(data, slot) {
  const bookings = data.bookings.filter(b => b.slotId === slot.id);
  return {
    id: slot.id,
    courseId: slot.courseId,
    courseTitle: courseTitle(data, slot.courseId),
    labName: slot.labName,
    location: slot.location,
    startsAt: slot.startsAt,
    capacity: slot.capacity,
    booked: bookings.length,
    started: new Date(slot.startsAt) <= new Date(),
    attendees: bookings.map(b => {
      const u = data.users.find(x => x.id === b.userId);
      return { bookingId: b.id, name: u ? u.name : 'Deleted user', email: u ? u.email : '' };
    })
  };
}

router.get('/slots', (req, res) => {
  const data = db.read();
  const slots = [...data.slots]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(s => slotAdminView(data, s));
  res.json({ slots });
});

// Checks the fields of a lab session. Returns an error message or null.
function slotProblem(data, body, bookedCount) {
  if (!data.courses.some(c => c.id === body.courseId)) return 'Choose a valid course';
  if (!String(body.labName || '').trim() || !String(body.location || '').trim()) return 'Lab name and location are required';
  if (isNaN(new Date(body.startsAt))) return 'Enter a valid start date and time';
  const capacity = Number(body.capacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) return 'Seats must be a whole number from 1 to 100';
  if (capacity < bookedCount) return `${bookedCount} students have already booked, so seats cannot be less than ${bookedCount}`;
  return null;
}

router.put('/slots/:id', (req, res) => {
  const data = db.read();
  const slot = data.slots.find(s => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Lab session not found' });

  const booked = data.bookings.filter(b => b.slotId === slot.id).length;
  const problem = slotProblem(data, req.body, booked);
  if (problem) return res.status(400).json({ error: problem });

  slot.courseId = req.body.courseId;
  slot.labName = String(req.body.labName).trim();
  slot.location = String(req.body.location).trim();
  slot.startsAt = new Date(req.body.startsAt).toISOString();
  slot.capacity = Number(req.body.capacity);
  db.write(data);
  res.json({ slot: slotAdminView(data, slot) });
});

router.delete('/slots/:id', (req, res) => {
  const data = db.read();
  const slot = data.slots.find(s => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Lab session not found' });
  const removed = data.bookings.filter(b => b.slotId === slot.id).length;
  data.slots = data.slots.filter(s => s.id !== slot.id);
  data.bookings = data.bookings.filter(b => b.slotId !== slot.id);
  db.write(data);
  res.json({ message: 'Lab session deleted', bookingsRemoved: removed });
});

// ---------- Certificates ----------

router.get('/certificates', (req, res) => {
  const data = db.read();
  const search = String(req.query.search || '').trim().toLowerCase();
  const list = data.certificates
    .filter(c => !search || c.id.toLowerCase().includes(search) || c.userName.toLowerCase().includes(search))
    .map(c => ({
      id: c.id, userName: c.userName, courseTitle: c.courseTitle, issuedAt: c.issuedAt,
      revoked: !!c.revoked, revokedReason: c.revokedReason || ''
    }))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  res.json({ certificates: list });
});

// PATCH /api/admin/certificates/:id   Body: { revoked: true|false, reason }
router.patch('/certificates/:id', (req, res) => {
  const data = db.read();
  const cert = data.certificates.find(c => c.id === req.params.id);
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  cert.revoked = !!req.body.revoked;
  cert.revokedReason = cert.revoked ? String(req.body.reason || '').trim().slice(0, 200) : '';
  db.write(data);
  res.json({ message: cert.revoked ? 'Certificate revoked' : 'Certificate restored' });
});

// ---------- Payments and fees ----------

router.get('/payments', (req, res) => {
  const data = db.read();
  const list = paid(data)
    .map(p => {
      const u = data.users.find(x => x.id === p.userId);
      return {
        id: p.id, studentName: u ? u.name : 'Deleted user', email: u ? u.email : '',
        courseTitle: courseTitle(data, p.courseId), amount: p.amount, method: p.method, paidAt: p.paidAt
      };
    })
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  res.json({ payments: list, total: list.reduce((sum, p) => sum + p.amount, 0) });
});

router.get('/courses', (req, res) => {
  const data = db.read();
  res.json({
    courses: data.courses.map(c => ({ id: c.id, title: c.title, level: c.level, hours: c.hours, price: c.price }))
  });
});

// PUT /api/admin/courses/:id/price   Body: { price }  (rupees, 0 makes the course free)
router.put('/courses/:id/price', (req, res) => {
  const data = db.read();
  const course = data.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const price = Number(req.body.price);
  if (!Number.isInteger(price) || price < 0 || price > 1000000) {
    return res.status(400).json({ error: 'The fee must be a whole number of rupees from 0 to 1000000' });
  }
  data.prices[course.id] = price;
  course.price = price;
  db.write(data);
  res.json({ course: { id: course.id, title: course.title, price } });
});

// ---------- CSV downloads ----------

function csvCell(value) {
  const text = String(value ?? '');
  // A leading = + - @ can run as a formula in Excel, so it is neutralised
  const safe = /^[=+\-@]/.test(text) ? "'" + text : text;
  return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
}

router.get('/export/:type', (req, res) => {
  const data = db.read();
  let header, rows;
  if (req.params.type === 'students') {
    header = ['Name', 'Email', 'Joined', 'Courses enrolled', 'Certificates', 'Lab bookings', 'Disabled'];
    rows = students(data).map(u => {
      const r = studentRow(data, u);
      return [r.name, r.email, r.createdAt, r.enrolledCourses, r.certificates, r.bookings, r.disabled ? 'yes' : 'no'];
    });
  } else if (req.params.type === 'payments') {
    header = ['Payment ID', 'Student', 'Email', 'Course', 'Amount (INR)', 'Method', 'Paid at'];
    rows = paid(data).map(p => {
      const u = data.users.find(x => x.id === p.userId) || {};
      return [p.id, u.name, u.email, courseTitle(data, p.courseId), p.amount, p.method, p.paidAt];
    });
  } else if (req.params.type === 'certificates') {
    header = ['Certificate ID', 'Student', 'Course', 'Issued', 'Status'];
    rows = data.certificates.map(c => [c.id, c.userName, c.courseTitle, c.issuedAt, c.revoked ? 'revoked' : 'valid']);
  } else {
    return res.status(404).json({ error: 'Unknown export' });
  }
  const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${req.params.type}.csv"`);
  res.send(csv);
});

module.exports = router;

// Helper functions used within this file
const students = data => data.users.filter(u => u.role === 'student');
const paid = data => data.payments.filter(p => p.status === 'paid');
const courseTitle = (data, id) => (data.courses.find(c => c.id === id) || { title: 'Unknown course' }).title;
const hasPaid = (data, userId, courseId) =>
  data.payments.some(p => p.userId === userId && p.courseId === courseId && p.status === 'paid');

function bestScore(record) {
  return record && record.attempts.length ? Math.max(...record.attempts.map(a => a.score)) : null;
}