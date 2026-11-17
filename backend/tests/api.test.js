// Run with: npm test
// These tests start the real app on a temporary data folder and call it like a browser would.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-test-'));
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.CERT_SECRET = 'test-cert-secret';
process.env.ADMIN_PASSWORD = 'AdminPass123';
process.env.REGISTER_LIMIT = '100';
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;

require('../config');
// config.js loads backend/.env, which may hold real keys. The tests must never use them
// (no real payments, no real emails), so remove them again before the app starts.
for (const key of ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'BREVO_API_KEY', 'RESEND_API_KEY', 'CONTACT_EMAIL', 'MAIL_FROM_EMAIL']) {
  delete process.env[key];
}
const db = require('../db');
const { createApp } = require('../app');

let server;
let base;
const tokens = {};

async function call(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(base + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const type = response.headers.get('content-type') || '';
  const data = type.includes('json') ? await response.json() : await response.text();
  return { status: response.status, data, type };
}

async function register(name, email) {
  const r = await call('POST', '/api/auth/register', { name, email, password: 'Password123' });
  if (r.status === 201) {
    const d = db.read(); d.users.find(u => u.email === email).emailVerified = true; db.write(d);
    tokens[name] = r.data.token;
    return r.data.user;
  }
  // User may already exist from another test; try to log in instead
  const login = await call('POST', '/api/auth/login', { email, password: 'Password123' });
  if (login.status === 200) {
    tokens[name] = login.data.token;
    return login.data.user;
  }
  throw new Error('Registration failed with status ' + r.status);
}

async function enrol(token, courseId) {
  const order = await call('POST', '/api/payments/order', { courseId }, token);
  assert.equal(order.status, 201);
  const done = await call('POST', '/api/payments/demo-confirm', { paymentId: order.data.paymentId }, token);
  assert.equal(done.status, 200);
}

const course = id => db.read().courses.find(c => c.id === id);

test.before(async () => {
  await db.init();
  server = createApp().listen(0);
  base = 'http://127.0.0.1:' + server.address().port;
  const login = await call('POST', '/api/auth/login', { email: 'admin@evschool.com', password: 'AdminPass123' });
  assert.equal(login.status, 200);
  tokens.admin = login.data.token;
  await register('alice', 'alice@test.com');
  await register('bob', 'bob@test.com');
});

test.after(() => server.close());

test('health check and public course catalogue with fees', async () => {
  assert.equal((await call('GET', '/healthz')).data.ok, true);
  const { data } = await call('GET', '/api/courses');
  assert.equal(data.courses.length, 5);
  assert.ok(data.courses.every(c => c.price > 0));
});

test('sign-up checks and login', async () => {
  assert.equal((await call('POST', '/api/auth/register', { name: 'X', email: 'bad', password: 'Password123' })).status, 400);
  assert.equal((await call('POST', '/api/auth/register', { name: 'X', email: 'x@a.com', password: 'short' })).status, 400);
  await register('alice', 'alice@test.com');
  assert.equal((await call('POST', '/api/auth/register', { name: 'A', email: 'alice@test.com', password: 'Password123' })).status, 409);
  assert.equal((await call('POST', '/api/auth/login', { email: 'alice@test.com', password: 'wrong-password' })).status, 401);
  assert.equal((await call('GET', '/api/auth/me', null, tokens.alice)).data.user.email, 'alice@test.com');
});

test('private routes need login and admin routes need an admin', async () => {
  assert.equal((await call('GET', '/api/courses/my/progress')).status, 401);
  assert.equal((await call('GET', '/api/admin/stats', null, tokens.alice)).status, 403);
  assert.equal((await call('GET', '/api/admin/stats')).status, 401);
});

test('a course stays locked until the student pays', async () => {
  const view = await call('GET', '/api/courses/hv-safety', null, tokens.alice);
  assert.equal(view.data.locked, true);
  assert.ok(view.data.course.modules.every(m => m.preview || (Array.isArray(m.content) && m.content.length === 0)), 'only free preview lessons may be visible');
  const m = course('hv-safety').modules[0];
  assert.equal((await call('POST', `/api/courses/hv-safety/modules/${m.id}/complete`, null, tokens.alice)).status, 402);
  assert.equal((await call('GET', '/api/courses/hv-safety/assessment', null, tokens.alice)).status, 402);
});

test('demo payment unlocks the course and cannot be repeated', async () => {
  const cfg = await call('GET', '/api/payments/config');
  assert.equal(cfg.data.mode, 'demo');
  await enrol(tokens.alice, 'hv-safety');
  const view = await call('GET', '/api/courses/hv-safety', null, tokens.alice);
  assert.equal(view.data.locked, false);
  assert.ok(JSON.stringify(view.data.course.modules[0].content).length > 20);
  assert.equal((await call('POST', '/api/payments/order', { courseId: 'hv-safety' }, tokens.alice)).status, 409);
  const mine = await call('GET', '/api/payments/me', null, tokens.alice);
  assert.equal(mine.data.payments.length, 1);
  assert.equal(mine.data.payments[0].amount, course('hv-safety').price);
});

test('assessment: locked first, fails on wrong answers, passes and issues a certificate', async () => {
  const c = course('hv-safety');
  assert.equal((await call('GET', '/api/courses/hv-safety/assessment', null, tokens.alice)).status, 403);
  for (const m of c.modules) {
    assert.equal((await call('POST', `/api/courses/hv-safety/modules/${m.id}/complete`, null, tokens.alice)).status, 200);
  }
  const questions = (await call('GET', '/api/courses/hv-safety/assessment', null, tokens.alice)).data.questions;
  assert.ok(questions.every(q => q.answer === undefined), 'answers must not be sent to the student');

  const wrong = Object.fromEntries(c.assessment.map(q => [q.id, (q.answer + 1) % q.options.length]));
  const fail = await call('POST', '/api/courses/hv-safety/assessment', { answers: wrong }, tokens.alice);
  assert.equal(fail.data.passed, false);
  assert.equal(fail.data.certificateId, null);

  const right = Object.fromEntries(c.assessment.map(q => [q.id, q.answer]));
  const pass = await call('POST', '/api/courses/hv-safety/assessment', { answers: right }, tokens.alice);
  assert.equal(pass.data.passed, true);
  assert.equal(pass.data.score, 100);
  assert.match(pass.data.certificateId, /^EVT-\d{4}-[0-9A-F]{6}$/);
  tokens.certId = pass.data.certificateId;

  const again = await call('POST', '/api/courses/hv-safety/assessment', { answers: right }, tokens.alice);
  assert.equal(again.data.certificateId, tokens.certId, 'passing twice must not create a second certificate');
});

test('certificate check: genuine, tampered and revoked', async () => {
  const check = () => call('GET', '/api/certificates/verify/' + tokens.certId);
  assert.equal((await check()).data.valid, true);
  assert.equal((await call('GET', '/api/certificates/verify/EVT-0000-FFFFFF')).status, 404);

  const data = db.read();
  data.certificates.find(c => c.id === tokens.certId).userName = 'Someone Else';
  db.write(data);
  assert.equal((await check()).data.valid, false, 'edited certificate must fail');
  data.certificates.find(c => c.id === tokens.certId).userName = 'alice';
  db.write(data);
  assert.equal((await check()).data.valid, true);

  const revoke = await call('PATCH', '/api/admin/certificates/' + tokens.certId, { revoked: true, reason: 'Test' }, tokens.admin);
  assert.equal(revoke.status, 200);
  const revoked = (await check()).data;
  assert.equal(revoked.valid, false);
  assert.equal(revoked.revoked, true);
  await call('PATCH', '/api/admin/certificates/' + tokens.certId, { revoked: false }, tokens.admin);
  assert.equal((await check()).data.valid, true);
});

test('lab booking: seats, double booking, cancelling and admin limits', async () => {
  await register('bob', 'bob@test.com');
  const slots = (await call('GET', '/api/bookings/slots', null, tokens.alice)).data.slots;
  const slot = slots.find(s => s.courseId === 'hv-safety');

  const edit = await call('PUT', '/api/admin/slots/' + slot.id,
    { courseId: 'hv-safety', labName: 'Test Lab', location: 'Bay 9', startsAt: slot.startsAt, capacity: 1 }, tokens.admin);
  assert.equal(edit.status, 200);
  assert.equal(edit.data.slot.capacity, 1);

  const first = await call('POST', '/api/bookings', { slotId: slot.id }, tokens.alice);
  assert.equal(first.status, 201);
  assert.equal((await call('POST', '/api/bookings', { slotId: slot.id }, tokens.alice)).status, 409);
  const full = await call('POST', '/api/bookings', { slotId: slot.id }, tokens.bob);
  assert.equal(full.status, 409);
  assert.match(full.data.error, /fully booked/);

  const tooSmall = await call('PUT', '/api/admin/slots/' + slot.id,
    { courseId: 'hv-safety', labName: 'Test Lab', location: 'Bay 9', startsAt: slot.startsAt, capacity: 0 }, tokens.admin);
  assert.equal(tooSmall.status, 400);

  const adminList = (await call('GET', '/api/admin/slots', null, tokens.admin)).data.slots.find(s => s.id === slot.id);
  assert.equal(adminList.booked, 1);
  assert.equal(adminList.attendees[0].email, 'alice@test.com');

  assert.equal((await call('DELETE', '/api/bookings/' + first.data.booking.id, null, tokens.bob)).status, 403);
  assert.equal((await call('DELETE', '/api/bookings/' + first.data.booking.id, null, tokens.alice)).status, 200);
  assert.equal((await call('POST', '/api/bookings', { slotId: slot.id }, tokens.bob)).status, 201);

  const del = await call('DELETE', '/api/admin/slots/' + slot.id, null, tokens.admin);
  assert.equal(del.data.bookingsRemoved, 1);
  assert.equal((await call('GET', '/api/bookings/me', null, tokens.bob)).data.bookings.length, 0);

  const past = await call('POST', '/api/bookings/slots',
    { courseId: 'hv-safety', labName: 'L', location: 'B', startsAt: '2020-01-01T10:00', capacity: 3 }, tokens.admin);
  assert.equal(past.status, 400);
});

test('admin overview, students, fees and access', async () => {
  // Students alice and bob are registered in test.before()
  const stats = (await call('GET', '/api/admin/stats', null, tokens.admin)).data;
  assert.equal(stats.students, 2);
  assert.equal(stats.enrolments, 1);
  assert.equal(stats.revenue, course('hv-safety').price);
  assert.equal(stats.certificates, 1);
  const row = stats.perCourse.find(c => c.courseId === 'hv-safety');
  assert.equal(row.passed, 1);
  assert.equal(row.averageBestScore, 100);

  const found = (await call('GET', '/api/admin/students?search=ALICE', null, tokens.admin)).data.students;
  assert.equal(found.length, 1);
  const detail = (await call('GET', '/api/admin/students/' + found[0].id, null, tokens.admin)).data;
  assert.equal(detail.courses.find(c => c.courseId === 'hv-safety').passed, true);
  assert.equal(detail.certificates.length, 1);

  const bobId = (await call('GET', '/api/admin/students?search=bob', null, tokens.admin)).data.students[0].id;
  assert.equal((await call('POST', `/api/admin/students/${bobId}/enrol`, { courseId: 'battery-diagnostics' }, tokens.admin)).status, 201);
  assert.equal((await call('POST', `/api/admin/students/${bobId}/enrol`, { courseId: 'battery-diagnostics' }, tokens.admin)).status, 409);
  assert.equal((await call('GET', '/api/courses/battery-diagnostics', null, tokens.bob)).data.locked, false);

  assert.equal((await call('PUT', '/api/admin/courses/charging-systems/price', { price: -5 }, tokens.admin)).status, 400);
  assert.equal((await call('PUT', '/api/admin/courses/charging-systems/price', { price: 0 }, tokens.admin)).status, 200);
  assert.equal((await call('GET', '/api/courses/charging-systems', null, tokens.bob)).data.locked, false, 'a free course needs no payment');
  await call('PUT', '/api/admin/courses/charging-systems/price', { price: 2500 }, tokens.admin);

  const pay = (await call('GET', '/api/admin/payments', null, tokens.admin)).data;
  assert.equal(pay.payments.length, 2);
  assert.equal(pay.total, course('hv-safety').price);
});

test('admin can disable an account and reset a password', async () => {
  const bobId = (await call('GET', '/api/admin/students?search=bob', null, tokens.admin)).data.students[0].id;
  assert.equal((await call('PATCH', '/api/admin/students/' + bobId, { disabled: true }, tokens.admin)).status, 200);
  assert.equal((await call('GET', '/api/auth/me', null, tokens.bob)).status, 403);
  assert.equal((await call('POST', '/api/auth/login', { email: 'bob@test.com', password: 'Password123' })).status, 403);
  await call('PATCH', '/api/admin/students/' + bobId, { disabled: false }, tokens.admin);

  assert.equal((await call('POST', `/api/admin/students/${bobId}/reset-password`, { password: 'short' }, tokens.admin)).status, 400);
  await call('POST', `/api/admin/students/${bobId}/reset-password`, { password: 'BrandNewPass1' }, tokens.admin);
  assert.equal((await call('POST', '/api/auth/login', { email: 'bob@test.com', password: 'BrandNewPass1' })).status, 200);
});

test('students can change their own password', async () => {
  assert.equal((await call('POST', '/api/auth/change-password', { currentPassword: 'nope', newPassword: 'NewPassword9' }, tokens.alice)).status, 400);
  assert.equal((await call('POST', '/api/auth/change-password', { currentPassword: 'Password123', newPassword: 'short' }, tokens.alice)).status, 400);
  assert.equal((await call('POST', '/api/auth/change-password', { currentPassword: 'Password123', newPassword: 'NewPassword9' }, tokens.alice)).status, 200);
  assert.equal((await call('POST', '/api/auth/login', { email: 'alice@test.com', password: 'NewPassword9' })).status, 200);
});

test('CSV downloads work and block spreadsheet formulas', async () => {
  await register('=cmd', 'formula@test.com');
  const r = await call('GET', '/api/admin/export/students', null, tokens.admin);
  assert.equal(r.status, 200);
  assert.match(r.type, /text\/csv/);
  assert.ok(r.data.startsWith('Name,Email'));
  assert.ok(r.data.includes('=cmd'), 'a name starting with = must be neutralised');
  assert.equal((await call('GET', '/api/admin/export/nothing', null, tokens.admin)).status, 404);
});

test('Razorpay mode: order, bad signature rejected, good signature accepted', async () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_secret';
  const realFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (String(url).startsWith('https://api.razorpay.com/')) {
      const sent = JSON.parse(options.body);
      assert.equal(sent.currency, 'INR');
      assert.ok(options.headers.Authorization.startsWith('Basic '));
      return { ok: true, json: async () => ({ id: 'order_ABC123', amount: sent.amount }) };
    }
    return realFetch(url, options);
  };
  try {
    const cfg = (await call('GET', '/api/payments/config')).data;
    assert.equal(cfg.mode, 'razorpay');
    assert.equal(cfg.keyId, 'rzp_test_key');

    const order = await call('POST', '/api/payments/order', { courseId: 'motor-inverter' }, tokens.alice);
    assert.equal(order.status, 201);
    assert.equal(order.data.orderId, 'order_ABC123');
    assert.equal((await call('POST', '/api/payments/demo-confirm', { paymentId: order.data.paymentId }, tokens.alice)).status, 400);

    const bad = await call('POST', '/api/payments/verify',
      { orderId: 'order_ABC123', razorpayPaymentId: 'pay_1', signature: 'f'.repeat(64) }, tokens.alice);
    assert.equal(bad.status, 400);
    assert.equal((await call('GET', '/api/courses/motor-inverter', null, tokens.alice)).data.locked, true);

    const signature = crypto.createHmac('sha256', 'rzp_secret').update('order_ABC123|pay_1').digest('hex');
    const good = await call('POST', '/api/payments/verify',
      { orderId: 'order_ABC123', razorpayPaymentId: 'pay_1', signature }, tokens.alice);
    assert.equal(good.status, 200);
    assert.equal(good.data.payment.status, 'paid');
    assert.equal((await call('GET', '/api/courses/motor-inverter', null, tokens.alice)).data.locked, false);

    // Someone else cannot confirm another student's order
    assert.equal((await call('POST', '/api/payments/verify',
      { orderId: 'order_ABC123', razorpayPaymentId: 'pay_1', signature }, tokens.bob)).status, 404);
  } finally {
    global.fetch = realFetch;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test('contact form, password-reset requests and the admin inbox', async () => {
  assert.equal((await call('POST', '/api/site/contact', { name: 'Ravi', email: 'not-an-email', message: 'Hello there, I have a question' })).status, 400);
  const sent = await call('POST', '/api/site/contact', { name: 'Ravi', email: 'ravi@test.com', subject: 'Fees', message: 'Do you offer group discounts?' });
  assert.equal(sent.status, 201);

  assert.equal((await call('GET', '/api/site/admin/messages')).status, 401);
  assert.equal((await call('GET', '/api/site/admin/messages', null, tokens.alice)).status, 403);

  const reset = await call('POST', '/api/site/password-reset-request', { email: 'alice@test.com' });
  assert.equal(reset.status, 200);
  await call('POST', '/api/site/password-reset-request', { email: 'alice@test.com' });
  const unknown = await call('POST', '/api/site/password-reset-request', { email: 'nobody@test.com' });
  assert.equal(unknown.data.message, reset.data.message, 'the answer must not reveal whether an account exists');

  const inbox = await call('GET', '/api/site/admin/messages', null, tokens.admin);
  assert.equal(inbox.status, 200);
  assert.equal(inbox.data.messages.filter(m => m.type === 'password-reset').length, 1, 'repeat requests are not duplicated');
  const contact = inbox.data.messages.find(m => m.type === 'contact');
  assert.equal(contact.subject, 'Fees');

  const done = await call('PATCH', `/api/site/admin/messages/${contact.id}`, { handled: true }, tokens.admin);
  assert.equal(done.data.message.handled, true);
  assert.equal((await call('DELETE', `/api/site/admin/messages/${contact.id}`, null, tokens.admin)).status, 200);
  assert.equal((await call('DELETE', `/api/site/admin/messages/${contact.id}`, null, tokens.admin)).status, 404);
});

test('announcements: admin posts, everyone can read', async () => {
  assert.equal((await call('POST', '/api/site/admin/announcements', { title: '', body: '' }, tokens.admin)).status, 400);
  assert.equal((await call('POST', '/api/site/admin/announcements', { title: 'Hi', body: 'Hello' }, tokens.alice)).status, 403);
  const made = await call('POST', '/api/site/admin/announcements', { title: 'New batch', body: 'Lab sessions open next week.' }, tokens.admin);
  assert.equal(made.status, 201);
  const list = await call('GET', '/api/site/announcements');
  assert.ok(list.data.announcements.some(a => a.title === 'New batch'));
  assert.equal((await call('DELETE', `/api/site/admin/announcements/${made.data.announcement.id}`, null, tokens.admin)).status, 200);
  const after = await call('GET', '/api/site/announcements');
  assert.ok(!after.data.announcements.some(a => a.title === 'New batch'));
});

test('course reviews: only enrolled students, one each, public ratings', async () => {
  await register('dina', 'dina@test.com');
  assert.equal((await call('POST', '/api/site/reviews/hv-safety', { rating: 5 })).status, 401);
  assert.equal((await call('POST', '/api/site/reviews/hv-safety', { rating: 5 }, tokens.dina)).status, 402);
  assert.equal((await call('POST', '/api/site/reviews/hv-safety', { rating: 5 }, tokens.admin)).status, 403);
  assert.equal((await call('POST', '/api/site/reviews/hv-safety', { rating: 9 }, tokens.alice)).status, 400);
  assert.equal((await call('POST', '/api/site/reviews/nope', { rating: 5 }, tokens.alice)).status, 404);

  const first = await call('POST', '/api/site/reviews/hv-safety', { rating: 4, comment: 'Clear and practical.' }, tokens.alice);
  assert.equal(first.status, 201);
  const edited = await call('POST', '/api/site/reviews/hv-safety', { rating: 5, comment: 'Clear, practical and safe.' }, tokens.alice);
  assert.equal(edited.data.summary.count, 1, 'a second review edits the first one');
  assert.equal(edited.data.summary.average, 5);

  const publicList = await call('GET', '/api/site/reviews/hv-safety');
  assert.equal(publicList.status, 200);
  assert.equal(publicList.data.reviews.length, 1);
  assert.equal(publicList.data.reviews[0].comment, 'Clear, practical and safe.');
  assert.equal(publicList.data.reviews[0].userId, undefined, 'no private ids in public reviews');

  const featured = await call('GET', '/api/site/reviews/featured');
  assert.equal(featured.data.reviews.length, 1);

  const catalogue = await call('GET', '/api/courses');
  assert.equal(catalogue.data.courses.find(c => c.id === 'hv-safety').rating.count, 1);

  const preview = await call('GET', '/api/courses/hv-safety/preview');
  assert.equal(preview.status, 200);
  assert.ok(preview.data.course.modules.length > 0);
  assert.equal(preview.data.course.modules[0].content, undefined, 'lesson text must stay private');
  assert.equal((await call('GET', '/api/courses/nope/preview')).status, 404);

  const all = await call('GET', '/api/site/admin/reviews', null, tokens.admin);
  assert.equal(all.data.reviews.length, 1);
  assert.equal((await call('DELETE', `/api/site/admin/reviews/${all.data.reviews[0].id}`, null, tokens.admin)).status, 200);
  assert.equal((await call('GET', '/api/site/reviews/hv-safety')).data.reviews.length, 0);
});

test('students can update their display name', async () => {
  await register('erin', 'erin@test.com');
  assert.equal((await call('PATCH', '/api/auth/profile', { name: 'E' }, tokens.erin)).status, 400);
  const ok = await call('PATCH', '/api/auth/profile', { name: 'Erin Stone' }, tokens.erin);
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.name, 'Erin Stone');
  assert.equal((await call('GET', '/api/auth/me', null, tokens.erin)).data.user.name, 'Erin Stone');
});

test('MongoDB storage saves only changes, keeps dates as Dates and survives a restart', async () => {
  const { createMongoStore } = require('../src/db/mongoStore');
  // Minimal in-memory stand-in for MongoDB driver collections
  const colls = {};
  const bulkCalls = [];
  const match = (doc, filter) => Object.entries(filter).every(([k, v]) => doc[k] === v);
  const getCollection = name => {
    colls[name] = colls[name] || [];
    const docs = colls[name];
    return {
      find: () => ({ toArray: async () => docs.map(d => ({ _id: 'x', ...d })) }),
      countDocuments: async () => docs.length,
      async bulkWrite(ops) {
        bulkCalls.push({ name, ops });
        for (const op of ops) {
          if (op.replaceOne) {
            const i = docs.findIndex(d => match(d, op.replaceOne.filter));
            if (i >= 0) docs[i] = op.replaceOne.replacement; else docs.push(op.replaceOne.replacement);
          } else if (op.deleteOne) {
            const i = docs.findIndex(d => match(d, op.deleteOne.filter));
            if (i >= 0) docs.splice(i, 1);
          }
        }
      }
    };
  };
  const store = createMongoStore(getCollection);
  const cfg = require('../config');
  const savedFlags = { ...cfg.fromEnv };
  const savedSecret = process.env.JWT_SECRET;
  cfg.fromEnv.JWT_SECRET = false;
  cfg.fromEnv.CERT_SECRET = false;
  const fresh = () => {
    delete require.cache[require.resolve('../db')];
    const instance = require('../db');
    instance.useMongo(createMongoStore(getCollection));
    return instance;
  };
  try {
    const first = fresh();
    await first.init();
    assert.ok(colls.users.some(u => u.id === 'u-admin'), 'admin seeded into the users collection');
    assert.ok(colls.users[0].createdAt instanceof Date, 'dates are stored as real Dates');
    assert.ok(colls.labsessions.every(s => s.startsAt instanceof Date), 'lab session dates are Dates');
    assert.ok(colls.appsecrets.some(s => s.key === 'JWT_SECRET'), 'secrets are kept in the database');

    const data = first.read();
    data.users.push({ id: 'u-mongo', name: 'Mongo', email: 'm@test.com', passwordHash: 'x', role: 'student', createdAt: new Date().toISOString(), resetExpires: new Date(Date.now() + 3600000).toISOString() });
    data.prices['hv-safety'] = 555;
    bulkCalls.length = 0;
    first.write(data);
    await first.flush();
    assert.deepEqual(bulkCalls.map(c => c.name).sort(), ['courseprices', 'users'], 'only changed collections are written');
    assert.equal(bulkCalls.find(c => c.name === 'users').ops.length, 1, 'only the new user is written');

    process.env.JWT_SECRET = 'a-different-secret-after-restart';
    const second = fresh();
    await second.init();
    const back = second.read();
    const u = back.users.find(x => x.id === 'u-mongo');
    assert.ok(u, 'student survives a restart');
    assert.equal(typeof u.createdAt, 'string', 'routes receive ISO strings');
    assert.equal(typeof u.resetExpires, 'string');
    assert.equal(back.prices['hv-safety'], 555);
    assert.equal(back.courses.find(c => c.id === 'hv-safety').price, 555);
    assert.equal(process.env.JWT_SECRET, savedSecret, 'login secret is restored from the database');

    // Deleting a record removes it from the collection
    back.users = back.users.filter(x => x.id !== 'u-mongo');
    second.write(back);
    await second.flush();
    assert.ok(!colls.users.some(x => x.id === 'u-mongo'));
  } finally {
    process.env.JWT_SECRET = savedSecret;
    Object.assign(cfg.fromEnv, savedFlags);
  }
});
test('CORS only allows the sites listed in CORS_ORIGIN', async () => {
  const saved = process.env.CORS_ORIGIN;
  process.env.CORS_ORIGIN = 'https://school.example.com';
  const app = createApp();
  const srv = await new Promise(resolve => { const s2 = app.listen(0, () => resolve(s2)); });
  const url = `http://127.0.0.1:${srv.address().port}`;
  try {
    const ok = await fetch(url + '/api/courses', { method: 'OPTIONS', headers: { Origin: 'https://school.example.com' } });
    assert.equal(ok.status, 204);
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://school.example.com');
    const bad = await fetch(url + '/api/courses', { method: 'OPTIONS', headers: { Origin: 'https://evil.example.com' } });
    assert.equal(bad.status, 403);
    assert.equal(bad.headers.get('access-control-allow-origin'), null);
    const plain = await fetch(url + '/api/courses', { headers: { Origin: 'https://evil.example.com' } });
    assert.equal(plain.headers.get('access-control-allow-origin'), null);
  } finally {
    srv.close();
    if (saved === undefined) delete process.env.CORS_ORIGIN; else process.env.CORS_ORIGIN = saved;
  }
});
test('lesson figures are sent to enrolled students and every image file exists', async () => {
  const fs = require('fs');
  const path = require('path');
  const COURSES = require('../courseContent');
  let count = 0;
  COURSES.forEach(c => c.modules.forEach(m => (m.figures || []).forEach(f => {
    count++;
    assert.ok(f.alt && f.caption, `${m.id} figure needs alt text and a caption`);
    assert.ok(f.after >= 0 && f.after < m.content.length, `${m.id} figure is placed after a real paragraph`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', '..', 'frontend', 'public', f.src)), `${f.src} exists`);
  })));
  assert.ok(count >= 6, 'at least six diagrams');

  const open = (await call('GET', '/api/courses/hv-safety', null, tokens.alice)).data;
  assert.equal(open.locked, false);
  assert.ok(open.course.modules.some(m => m.figures.length > 0));
  const mine = (await call('GET', '/api/courses/my/progress', null, tokens.alice)).data.progress;
  const notEnrolled = mine.find(p => !p.enrolled);
  if (notEnrolled) {
    const locked = (await call('GET', '/api/courses/' + notEnrolled.courseId, null, tokens.alice)).data;
    assert.equal(locked.locked, true);
    assert.ok(locked.course.modules.every(m => m.preview || m.content.length === 0), 'locked courses send only preview modules');
    assert.ok(locked.course.modules.some(m => m.preview && m.content.length > 0), 'a free preview module is available');
    assert.ok(locked.course.modules.every(m => m.figures.length === 0), 'locked courses send no figures');
  }
});

test('students choose a payment method when enrolling', async () => {
  const cfg = (await call('GET', '/api/payments/config')).data;
  assert.deepEqual(Object.keys(cfg.methods), ['upi', 'card', 'netbanking', 'wallet']);
  const order = await call('POST', '/api/payments/order', { courseId: 'hv-wiring-repair', paymentMethod: 'netbanking' }, tokens.alice);
  assert.equal(order.status, 201);
  assert.equal(order.data.paymentMethod, 'netbanking');
  await call('POST', '/api/payments/demo-confirm', { paymentId: order.data.paymentId }, tokens.alice);
  const mine = (await call('GET', '/api/payments/me', null, tokens.alice)).data.payments;
  assert.equal(mine.find(p => p.courseId === 'hv-wiring-repair').paymentMethod, 'netbanking');
  // an unknown method falls back to UPI instead of being stored
  const progress = (await call('GET', '/api/courses/my/progress', null, tokens.alice)).data.progress;
  const unpaid = progress.find(p => !p.enrolled);
  const other = await call('POST', '/api/payments/order', { courseId: unpaid.courseId, paymentMethod: 'bitcoin' }, tokens.alice);
  assert.equal(other.status, 201, JSON.stringify(other.data));
  assert.equal(other.data.paymentMethod, 'upi');
});

test('email verification: unverified accounts cannot buy, links work once and expire', async () => {
  const { outbox } = require('../mailer');
  const reg = await call('POST', '/api/auth/register', { name: 'Dev', email: 'dev@test.com', password: 'Password123' });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.emailVerified, false);
  await new Promise(r => setTimeout(r, 50));
  const mail = outbox.filter(m => m.to === 'dev@test.com').pop();
  assert.ok(mail && mail.text.includes('verify-email.html?token='), 'verification email was sent');
  const token = mail.text.match(/token=([0-9a-f]{64})/)[1];

  const blocked = await call('POST', '/api/payments/order', { courseId: 'hv-safety', paymentMethod: 'upi' }, reg.data.token);
  assert.equal(blocked.status, 403);
  assert.equal(blocked.data.code, 'EMAIL_NOT_VERIFIED');
  assert.equal((await call('GET', '/api/auth/me', null, reg.data.token)).data.user.emailVerified, false);
  assert.equal((await call('POST', '/api/auth/verify-email', { token: 'f'.repeat(64) })).status, 400);

  const tooSoon = await call('POST', '/api/auth/resend-verification', null, reg.data.token);
  assert.equal(tooSoon.status, 429, 'resend is rate limited');

  const ok = await call('POST', '/api/auth/verify-email', { token });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.emailVerified, true);
  assert.equal((await call('GET', '/api/auth/me', null, reg.data.token)).data.user.emailVerified, true);
  assert.equal((await call('POST', '/api/auth/verify-email', { token })).status, 400, 'a link cannot be reused');
  const paid = await call('POST', '/api/payments/order', { courseId: 'hv-safety', paymentMethod: 'upi' }, reg.data.token);
  assert.equal(paid.status, 201);

  // expired link
  await call('POST', '/api/auth/register', { name: 'Old', email: 'old@test.com', password: 'Password123' });
  await new Promise(r => setTimeout(r, 50));
  const oldToken = outbox.filter(m => m.to === 'old@test.com').pop().text.match(/token=([0-9a-f]{64})/)[1];
  const d = db.read(); d.users.find(u => u.email === 'old@test.com').verifyExpires = Date.now() - 1000; db.write(d);
  assert.equal((await call('POST', '/api/auth/verify-email', { token: oldToken })).status, 400);
});

test('password reset by email and contact-form notification', async () => {
  const { outbox } = require('../mailer');
  await register('rita', 'rita@test.com');
  const ask = await call('POST', '/api/site/password-reset-request', { email: 'rita@test.com' });
  assert.equal(ask.status, 200);
  await new Promise(r => setTimeout(r, 50));
  const mail = outbox.filter(m => m.to === 'rita@test.com' && m.subject.includes('Reset')).pop();
  assert.ok(mail, 'reset email was sent');
  const token = mail.text.match(/token=([0-9a-f]{64})/)[1];
  assert.equal((await call('POST', '/api/auth/reset-password', { token, password: 'short' })).status, 400);
  assert.equal((await call('POST', '/api/auth/reset-password', { token, password: 'NewPassword456' })).status, 200);
  assert.equal((await call('POST', '/api/auth/reset-password', { token, password: 'Another789Pass' })).status, 400, 'link works once');
  assert.equal((await call('POST', '/api/auth/login', { email: 'rita@test.com', password: 'NewPassword456' })).status, 200);
  assert.equal((await call('POST', '/api/auth/login', { email: 'rita@test.com', password: 'Password123' })).status, 401);

  process.env.CONTACT_EMAIL = 'owner@test.com';
  const sent = await call('POST', '/api/site/contact', { name: 'Visitor', email: 'v@test.com', subject: 'Hi', message: 'I have a question about courses.' });
  assert.equal(sent.status, 201);
  await new Promise(r => setTimeout(r, 50));
  assert.ok(outbox.some(m => m.to === 'owner@test.com' && m.text.includes('question about courses')), 'owner was emailed');
  delete process.env.CONTACT_EMAIL;
});
