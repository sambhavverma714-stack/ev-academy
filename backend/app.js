// Builds the Express app. server.js starts it, and the tests use it directly.
// This service is an API only: the Next.js frontend is deployed separately and
// talks to it over HTTP.
const express = require('express');

const { rateLimit } = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const bookingRoutes = require('./routes/bookings');
const certificateRoutes = require('./routes/certificates');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const siteRoutes = require('./routes/site');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Render and similar hosts sit behind a proxy. This makes req.ip the visitor's real address.
  app.set('trust proxy', 1);

  // Basic security headers
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });

  // CORS: lets the separate Next.js site call this API. Set CORS_ORIGIN to a comma-separated
  // list of allowed site addresses (for example https://your-site.vercel.app). In development,
  // common local origins are also allowed so localhost:3000 works out of the box.
  const allowedOrigins = String(process.env.CORS_ORIGIN || '')
    .split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001']
      .forEach(o => { if (!allowedOrigins.includes(o)) allowedOrigins.push(o); });
  }
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.set('Access-Control-Max-Age', '600');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
    next();
  });

  app.use(express.json({ limit: '100kb' }));

  // Slow down repeated login and sign-up attempts
  app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
  app.use('/api/auth/register', rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.REGISTER_LIMIT) || 10 }));

  // Used by the hosting service to check the app is running
  app.get('/healthz', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/site', siteRoutes);

  app.get('/', (req, res) => {
    res.json({ service: 'EV Academy API', status: 'ok', health: '/healthz' });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'The request data is not valid JSON' });
    }
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  });

  return app;
}

module.exports = { createApp };
