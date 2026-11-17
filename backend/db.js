// Data storage for the EV Academy API.
// MongoDB is the database: set MONGODB_URI (a local server or MongoDB Atlas) and the whole
// data set is kept safely in MongoDB, so nothing is lost on restart or redeploy.
// For local development only, when MONGODB_URI is not set, data is kept in
// backend/data/db.json so the API can run without a database.
// Routes use read() and write(). Both are fast because the data is kept in memory.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const COURSES = require('./courseContent');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const TMP_FILE = DB_FILE + '.tmp';

// Default course fees in rupees. Admins can change them in the admin panel.
const DEFAULT_PRICES = {
  'hv-safety': 499,
  'battery-diagnostics': 999,
  'charging-systems': 799,
  'motor-inverter': 799,
  'hv-wiring-repair': 999
};

// Lab room used for each course when sessions are generated
const LABS = {
  'hv-safety': { labName: 'HV Isolation Lab', location: 'Bay 1 - Training Workshop', capacity: 6, hour: 9 },
  'battery-diagnostics': { labName: 'Battery Diagnostics Lab', location: 'Bay 2 - Battery Station', capacity: 4, hour: 10 },
  'motor-inverter': { labName: 'Motor and Inverter Lab', location: 'Bay 3 - Drive Unit Station', capacity: 5, hour: 11 },
  'charging-systems': { labName: 'EV Charging Lab', location: 'Bay 4 - Charging Station', capacity: 6, hour: 13 },
  'hv-wiring-repair': { labName: 'HV Wiring Repair Lab', location: 'Bay 5 - Harness Workshop', capacity: 4, hour: 9 }
};

let cache = null;
let mongo = null; // MongoDB store (see src/db/mongoStore.js) when MONGODB_URI is set

// ---------- Lab sessions ----------
function makeSession(courseId, daysAhead) {
  const lab = LABS[courseId];
  const when = new Date();
  when.setDate(when.getDate() + daysAhead);
  when.setHours(lab.hour, 0, 0, 0);
  return {
    id: 's-' + crypto.randomBytes(3).toString('hex'),
    courseId,
    labName: lab.labName,
    location: lab.location,
    startsAt: when.toISOString(),
    capacity: lab.capacity
  };
}

// Makes sure every course has at least one lab session in the future
function ensureFutureSessions(data) {
  const now = new Date();
  let added = false;
  COURSES.forEach(course => {
    if (!LABS[course.id]) return;
    const hasFuture = data.slots.some(s => s.courseId === course.id && new Date(s.startsAt) > now);
    if (!hasFuture) {
      data.slots.push(makeSession(course.id, 7), makeSession(course.id, 14));
      added = true;
    }
  });
  return added;
}

// ---------- Seed data ----------
function buildSeed() {
  const email = (process.env.ADMIN_EMAIL || 'admin@evschool.com').toLowerCase();
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    // In production a random password is created and shown once in the server log
    password = process.env.NODE_ENV === 'production'
      ? crypto.randomBytes(9).toString('base64url')
      : 'Admin123!';
    console.log(`Admin account created: ${email} / ${password}  (change it after your first login)`);
  }
  return {
    users: [{
      id: 'u-admin',
      name: 'Admin',
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'admin',
      createdAt: new Date().toISOString()
    }],
    courses: [],
    progress: [],
    slots: [],
    bookings: [],
    certificates: [],
    payments: [],
    prices: {},
    messages: [],
    announcements: [],
    reviews: []
  };
}

// Brings older data files up to date without deleting anything
function migrate(data) {
  data.users = data.users || [];
  data.progress = data.progress || [];
  data.slots = data.slots || [];
  data.bookings = data.bookings || [];
  data.certificates = data.certificates || [];
  data.payments = data.payments || [];
  data.prices = data.prices || {};
  data.messages = data.messages || [];
  data.announcements = data.announcements || [];
  data.reviews = data.reviews || [];
  // Course content always follows courseContent.js. Fees come from the admin's settings.
  data.courses = COURSES.map(c => ({
    ...c,
    price: Number.isInteger(data.prices[c.id]) ? data.prices[c.id] : (DEFAULT_PRICES[c.id] || 0)
  }));
  ensureFutureSessions(data);
}

// Lets tests supply their own MongoDB store
function useMongo(store) {
  mongo = store;
}

let saving = false;
let pending = false;
let failed = false;

async function flushMongo() {
  if (saving) return;
  saving = true;
  try {
    while (pending) {
      pending = false;
      await mongo.save(cache);
      failed = false;
    }
  } catch (err) {
    console.error('MongoDB save failed, will retry:', err.message);
    failed = true;
    pending = true;
    setTimeout(flushMongo, 5000).unref();
  } finally {
    saving = false;
  }
}

// Waits until everything has been saved. Used when the server shuts down.
async function flush() {
  while (mongo && (saving || (pending && !failed))) {
    if (!saving) flushMongo();
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

function writeFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TMP_FILE, JSON.stringify(cache, null, 2));
  fs.renameSync(TMP_FILE, DB_FILE);
}

// ---------- Public functions ----------
async function init() {
  if (!mongo && process.env.MONGODB_URI) {
    mongo = await require('./src/db/mongoStore').connectMongoStore(process.env.MONGODB_URI);
    console.log('Using MongoDB for storage');
  }
  let data = null;

  if (mongo) {
    if (!(await mongo.isEmpty())) {
      data = await mongo.load();
    } else if (fs.existsSync(DB_FILE)) {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      console.log('Imported data/db.json into MongoDB');
    }
  } else if (fs.existsSync(DB_FILE)) {
    data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }

  if (!data) {
    data = buildSeed();
    console.log('Created a new data set with the admin account');
  }

  // With MongoDB, keep the secrets in it so logins and certificates stay valid
  // after a restart. Secrets set as real environment variables always win.
  if (mongo) {
    const cfg = require('./config');
    data.secrets = data.secrets || {};
    for (const key of ['JWT_SECRET', 'CERT_SECRET']) {
      if (cfg.fromEnv[key]) continue;
      if (data.secrets[key]) process.env[key] = data.secrets[key];
      else data.secrets[key] = process.env[key];
    }
  }

  migrate(data);
  cache = data;
  if (mongo) {
    pending = true;
    await flush();
  } else {
    writeFile();
  }
}

// Returns a copy of all data. Change the copy, then pass it to write().
function read() {
  return structuredClone(cache);
}

function write(data) {
  cache = data;
  if (mongo) {
    pending = true;
    flushMongo();
  } else {
    writeFile();
  }
}

module.exports = { init, read, write, flush, useMongo, DEFAULT_PRICES };
