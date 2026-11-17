// MongoDB storage backend for db.js.
// The routes keep using db.read() / db.write(); this module loads every collection
// into memory at start-up and, on each write(), saves only the documents that changed
// (inserts, updates and deletes) using bulk operations.
// Dates are stored as real BSON Dates (matching the Mongoose models) and handed to the
// routes as ISO strings, so the business logic is unchanged.
const crypto = require('crypto');

// cache key -> collection name, identity field(s) and date fields
const SPEC = {
  users: { name: 'users', key: ['id'], dates: ['createdAt', 'verifyExpires', 'verifyLastSentAt', 'resetExpires'] },
  progress: { name: 'courseprogresses', key: ['userId', 'courseId'], dates: ['createdAt', 'passedAt'] },
  slots: { name: 'labsessions', key: ['id'], dates: ['startsAt'] },
  bookings: { name: 'labbookings', key: ['id'], dates: ['bookedAt', 'cancelledAt'] },
  certificates: { name: 'certificates', key: ['id'], dates: ['issuedAt', 'revokedAt'] },
  payments: { name: 'payments', key: ['id'], dates: ['createdAt', 'paidAt'] },
  messages: { name: 'messages', key: ['id'], dates: ['createdAt'] },
  announcements: { name: 'announcements', key: ['id'], dates: ['createdAt'] },
  reviews: { name: 'reviews', key: ['id'], dates: ['createdAt'] }
};
const PRICES = { name: 'courseprices' };
const SECRETS = { name: 'appsecrets' };

const keyOf = (spec, doc) => spec.key.map(k => doc[k]).join('|');
const filterOf = (spec, doc) => Object.fromEntries(spec.key.map(k => [k, doc[k]]));

function toDb(spec, doc) {
  const out = { ...doc };
  for (const f of spec.dates) {
    if (typeof out[f] === 'string') {
      const d = new Date(out[f]);
      if (!Number.isNaN(d.getTime())) out[f] = d;
    }
  }
  return out;
}

function fromDb(spec, doc) {
  const out = { ...doc };
  delete out._id;
  delete out.__v;
  delete out.updatedAt;
  for (const f of spec.dates) {
    if (out[f] instanceof Date) out[f] = out[f].toISOString();
  }
  // Mongoose "timestamps" adds createdAt; keep it only where the app used it
  if (!spec.dates.includes('createdAt')) delete out.createdAt;
  return out;
}

const stable = obj => JSON.stringify(obj, (k, v) => (v instanceof Date ? v.toISOString() : v));

// getCollection(name) must return a MongoDB driver collection (find/bulkWrite/countDocuments).
function createMongoStore(getCollection) {
  const snapshots = {}; // cache key -> Map(docKey -> serialized doc)

  async function load() {
    const data = {};
    for (const [cacheKey, spec] of Object.entries(SPEC)) {
      const docs = await getCollection(spec.name).find({}).toArray();
      data[cacheKey] = docs.map(d => fromDb(spec, d));
      snapshots[cacheKey] = new Map(data[cacheKey].map(d => [keyOf(spec, d), stable(d)]));
    }
    const priceDocs = await getCollection(PRICES.name).find({}).toArray();
    data.prices = {};
    for (const p of priceDocs) data.prices[p.courseId] = p.price;
    snapshots.prices = new Map(Object.entries(data.prices).map(([k, v]) => [k, String(v)]));

    const secretDocs = await getCollection(SECRETS.name).find({}).toArray();
    data.secrets = {};
    for (const s of secretDocs) data.secrets[s.key] = s.value;
    snapshots.secrets = new Map(Object.entries(data.secrets).map(([k, v]) => [k, String(v)]));
    return data;
  }

  async function isEmpty() {
    const n = await getCollection(SPEC.users.name).countDocuments({});
    return n === 0;
  }

  async function bulk(collectionName, ops) {
    if (ops.length) await getCollection(collectionName).bulkWrite(ops, { ordered: true });
  }

  // Saves only what changed since the last load/save
  async function save(data) {
    for (const [cacheKey, spec] of Object.entries(SPEC)) {
      const prev = snapshots[cacheKey] || new Map();
      const next = new Map();
      const ops = [];
      for (const doc of data[cacheKey] || []) {
        const k = keyOf(spec, doc);
        const ser = stable(doc);
        next.set(k, ser);
        if (prev.get(k) !== ser) {
          ops.push({ replaceOne: { filter: filterOf(spec, doc), replacement: toDb(spec, doc), upsert: true } });
        }
      }
      for (const [k] of prev) {
        if (!next.has(k)) {
          const parts = k.split('|');
          ops.push({ deleteOne: { filter: Object.fromEntries(spec.key.map((f, i) => [f, parts[i]])) } });
        }
      }
      await bulk(spec.name, ops);
      snapshots[cacheKey] = next;
    }

    const prices = data.prices || {};
    const prevPrices = snapshots.prices || new Map();
    const priceOps = [];
    for (const [courseId, price] of Object.entries(prices)) {
      if (prevPrices.get(courseId) !== String(price)) {
        priceOps.push({ replaceOne: { filter: { courseId }, replacement: { courseId, price }, upsert: true } });
      }
    }
    for (const [courseId] of prevPrices) {
      if (!(courseId in prices)) priceOps.push({ deleteOne: { filter: { courseId } } });
    }
    await bulk(PRICES.name, priceOps);
    snapshots.prices = new Map(Object.entries(prices).map(([k, v]) => [k, String(v)]));

    const secrets = data.secrets || {};
    const prevSecrets = snapshots.secrets || new Map();
    const secretOps = [];
    for (const [key, value] of Object.entries(secrets)) {
      if (prevSecrets.get(key) !== String(value)) {
        secretOps.push({ replaceOne: { filter: { key }, replacement: { key, value }, upsert: true } });
      }
    }
    await bulk(SECRETS.name, secretOps);
    snapshots.secrets = new Map(Object.entries(secrets).map(([k, v]) => [k, String(v)]));
  }

  return { load, save, isEmpty, id: crypto.randomBytes(2).toString('hex') };
}

// Real connection through Mongoose (uses the same driver the models use)
async function connectMongoStore(uri) {
  const mongoose = require('mongoose');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, socketTimeoutMS: 45000 });
  // Load models so their indexes (unique id, email, userId+courseId) are created
  for (const m of ['User', 'CourseProgress', 'LabSession', 'LabBooking', 'Certificate', 'Payment',
    'CoursePrice', 'Message', 'Announcement', 'Review']) {
    const Model = require('./../models/' + m);
    await Model.init();
  }
  return createMongoStore(name => mongoose.connection.collection(name));
}

module.exports = { createMongoStore, connectMongoStore, SPEC };
