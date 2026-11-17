# EV Academy — EV Maintenance Training School

A production-ready training platform for electric-vehicle technicians, built on the team's
standard stack:

| Layer | Technology |
| --- | --- |
| Frontend | **Next.js** (App Router, React, TypeScript, Tailwind CSS, Framer Motion) |
| Backend | **Node.js + Express.js** REST API |
| Database | **MongoDB** with Mongoose models |

## Features

- **Premium automotive interface** — a dark, technical design language with a pointer-reactive
  hero, an interactive high-voltage system map, a system explorer and a programme configurator.
- **Five professional programmes** — HV safety, battery diagnostics, charging systems, motor and
  inverter, HV wiring and repair. Each has modules, diagrams, a free preview lesson and an
  assessment.
- **Accounts** — registration, login, email verification, password reset, profile management.
- **Student area** — progress tracking, module completion, assessment attempts, lab bookings,
  certificates and payment history.
- **Admin area** — students, fees, payments, certificates, lab sessions, contact inbox,
  announcements and reviews.
- **Payments** — Razorpay (UPI, card, net banking, wallet) with server-side signature verification,
  plus a demo mode for development.
- **Certificate verification** — HMAC-signed certificates that anyone can check by ID.

## Project structure

```
.
├── frontend/                       # Next.js application
│   ├── app/
│   │   ├── (public)/               # Home, courses, about, contact, FAQ, legal
│   │   ├── (auth)/                 # Login, register, verification, password reset
│   │   ├── admin/                  # Admin dashboard and management screens
│   │   ├── student/                # Student dashboard, learning, bookings, certificates
│   │   ├── checkout/               # Enrolment and payment
│   │   └── verify-certificate/     # Public certificate registry
│   ├── components/
│   │   ├── layout/                 # Navbar and footer
│   │   ├── interactive/            # Hero, system explorer, configurator, counters
│   │   └── ui/                     # Reusable primitives (button, card, input, …)
│   ├── contexts/                   # Authentication context
│   ├── lib/                        # API client, helpers, programme catalogue
│   └── types/                      # Shared domain types
└── backend/                        # Express.js API
    ├── routes/                     # auth, courses, bookings, certificates, payments, admin, site
    ├── middleware/                 # JWT auth, rate limiting
    ├── src/models/                 # Mongoose schemas
    ├── src/db/                     # MongoDB connection and storage layer
    ├── scripts/                    # Import existing data into MongoDB
    ├── tests/                      # 23 API tests (node:test)
    └── courseContent.js            # Course curriculum and assessment content
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- MongoDB (local server or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

```env
MONGODB_URI=mongodb://localhost:27017/ev-academy
CORS_ORIGIN=http://localhost:3000
```

Then:

```bash
npm run dev        # http://localhost:5050
```

On the first start the API creates the admin account and prints its credentials in the terminal.
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to choose them yourself.

> Without `MONGODB_URI` the API falls back to `backend/data/db.json` so you can run it without a
> database. That fallback is for local development only.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

Then:

```bash
npm run dev        # http://localhost:3000
```

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm start` | Start the API |
| `backend` | `npm run dev` | Start with nodemon |
| `backend` | `npm test` | Run the API test suite |
| `backend` | `npm run seed` | Import an existing `data/db.json` into MongoDB |
| `frontend` | `npm run dev` | Start the Next.js dev server |
| `frontend` | `npm run build` | Production build |
| `frontend` | `npm start` | Serve the production build |
| `frontend` | `npm run lint` | ESLint |

## API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/verify-email`, `/resend-verification`, `/reset-password`, `/change-password`; `GET /api/auth/me`; `PATCH /api/auth/profile` |
| Courses | `GET /api/courses`, `/:id/preview`, `/:id`, `/my/progress`; `POST /:id/modules/:moduleId/complete`; `GET/POST /:id/assessment` |
| Payments | `GET /api/payments/config`, `/me`; `POST /api/payments/order`, `/verify`, `/demo-confirm` |
| Bookings | `GET /api/bookings/slots`, `/me`; `POST /api/bookings`, `/slots`; `DELETE /api/bookings/:id` |
| Certificates | `GET /api/certificates/me`, `/verify/:id` |
| Site | announcements, reviews, contact, password-reset requests, admin inbox |
| Admin | stats, students, courses, payments, certificates, lab sessions, exports |

Security: JWT auth, bcrypt password hashing, rate limiting on login/registration/contact,
schema-level validation, hashed one-time tokens, and signed certificate records.

## Environment variables

### Backend

```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/ev-academy
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=            # generated automatically if empty
CERT_SECRET=           # generated automatically if empty
ADMIN_EMAIL=admin@evschool.com
ADMIN_PASSWORD=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
APP_URL=http://localhost:5050
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=EV Training School
BREVO_API_KEY=
RESEND_API_KEY=
CONTACT_EMAIL=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for MongoDB Atlas, Render (API) and Vercel (frontend) steps.

## Tests

```bash
cd backend && npm test     # 23 passing
cd frontend && npm run build
```

The API tests run against an in-memory MongoDB stand-in, so no database is required. They cover
authentication, enrolment, payments, assessments, certificates, bookings, the admin API, CORS,
lesson figures and email flows.

## Notes

- The frontend reads the API at `NEXT_PUBLIC_API_URL`. If the API is offline, public pages show
  the built-in programme catalogue so the interface remains complete.
- Emails are printed to the terminal until an email provider key is configured.
- Payments run in demo mode until Razorpay keys are set.

## License

Proprietary — all rights reserved.
