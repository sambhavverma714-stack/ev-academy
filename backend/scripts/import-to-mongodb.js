// Imports existing data into MongoDB.
//
// Usage (the source is never changed):
//   cd backend
//   MONGODB_URI="mongodb+srv://..." npm run seed
//   MONGODB_URI="mongodb+srv://..." npm run seed -- path/to/db.json
//
// By default it reads backend/data/db.json (the development data file) and upserts
// every record into MongoDB. Existing records with the same id are replaced, so the
// script can be run again safely.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Course = require('../src/models/Course');
const CourseProgress = require('../src/models/CourseProgress');
const LabSession = require('../src/models/LabSession');
const LabBooking = require('../src/models/LabBooking');
const Certificate = require('../src/models/Certificate');
const Payment = require('../src/models/Payment');
const CoursePrice = require('../src/models/CoursePrice');
const Message = require('../src/models/Message');
const Announcement = require('../src/models/Announcement');
const Review = require('../src/models/Review');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

const COLLECTIONS = [
  { key: 'users', model: User, keys: ['id'] },
  { key: 'courses', model: Course, keys: ['id'] },
  { key: 'progress', model: CourseProgress, keys: ['userId', 'courseId'] },
  { key: 'slots', model: LabSession, keys: ['id'] },
  { key: 'bookings', model: LabBooking, keys: ['id'] },
  { key: 'certificates', model: Certificate, keys: ['id'] },
  { key: 'payments', model: Payment, keys: ['id'] },
  { key: 'messages', model: Message, keys: ['id'] },
  { key: 'announcements', model: Announcement, keys: ['id'] },
  { key: 'reviews', model: Review, keys: ['id'] }
];

function clean(doc) {
  const out = { ...doc };
  delete out._id;
  delete out.__v;
  return out;
}

async function importFile(file) {
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  const report = [];

  for (const { key, model, keys } of COLLECTIONS) {
    const docs = Array.isArray(source[key]) ? source[key] : [];
    if (!docs.length || key === 'courses') {
      // Courses come from backend/courseContent.js, not from the old data file
      report.push(`${key}: ${docs.length} found, skipped`);
      continue;
    }
    const ops = docs.map(doc => {
      const record = clean(doc);
      const filter = Object.fromEntries(keys.map(k => [k, record[k]]));
      return { replaceOne: { filter, replacement: record, upsert: true } };
    });
    await model.bulkWrite(ops, { ordered: false });
    report.push(`${key}: ${docs.length} imported`);
  }

  const prices = source.prices || {};
  const priceOps = Object.entries(prices).map(([courseId, price]) => ({
    replaceOne: { filter: { courseId }, replacement: { courseId, price }, upsert: true }
  }));
  if (priceOps.length) await CoursePrice.bulkWrite(priceOps, { ordered: false });
  report.push(`prices: ${priceOps.length} imported`);

  const secrets = source.secrets || {};
  const secretOps = Object.entries(secrets).map(([key, value]) => ({
    replaceOne: { filter: { key }, replacement: { key, value }, upsert: true }
  }));
  if (secretOps.length) {
    await mongoose.connection.collection('appsecrets').bulkWrite(secretOps, { ordered: false });
  }

  return report;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to backend/.env or pass it in the environment.');
    process.exit(1);
  }

  const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(DATA_DIR, 'db.json');
  if (!fs.existsSync(file)) {
    console.error(`No data file found at ${file}. Nothing to import.`);
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected. Importing', file);

  const report = await importFile(file);
  report.forEach(line => console.log(' -', line));

  await mongoose.disconnect();
  console.log('Done. Source data was not modified.');
}

main().catch(async error => {
  console.error('Import failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
