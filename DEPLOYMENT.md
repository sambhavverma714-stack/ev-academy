# Deployment Guide

The system has two deployables:

- **API** — Express.js on Node.js (`backend/`), deployed to Render (or any Node host).
- **Website** — Next.js (`frontend/`), deployed to Vercel (or any Next.js host).
- **Database** — MongoDB Atlas.

## 1. MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username and password).
3. Allow network access from your API host (Render uses changing IPs, so `0.0.0.0/0` is common).
4. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ev-academy`

The API creates its collections and indexes automatically on first start.

## 2. API on Render

1. Create a **Web Service** and connect the repository.
2. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/healthz`
3. Environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ev-academy
CORS_ORIGIN=https://your-site.vercel.app
JWT_SECRET=<long random string>
CERT_SECRET=<long random string>
ADMIN_EMAIL=admin@evschool.com
ADMIN_PASSWORD=<strong password>
PORT=5050
```

Optional:

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
APP_URL=https://your-api.onrender.com
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=EV Training School
BREVO_API_KEY=
RESEND_API_KEY=
CONTACT_EMAIL=
```

Deploy. The API serves JSON only: `/healthz` returns `{ "ok": true }`, `/` returns service
information, and `/api/*` is the REST API.

## 3. Website on Vercel

1. Import the repository and set **Root Directory** to `frontend`.
2. Framework preset: Next.js. Build command `npm run build`.
3. Environment variable:

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

4. Deploy, then add the Vercel domain to `CORS_ORIGIN` on the API and redeploy the API.

## 4. First run checks

- [ ] `GET https://your-api.onrender.com/healthz` returns `{ "ok": true }`
- [ ] The website loads and course cards show live fees
- [ ] Admin login works with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Registration sends a verification email (or prints it in the API log)
- [ ] Enrolment works in demo mode
- [ ] A lab session can be booked
- [ ] Certificate verification returns a result
- [ ] A request from an unlisted origin is rejected by CORS

## Moving existing data into MongoDB

The API imports `backend/data/db.json` automatically on the first start if MongoDB is empty.
To import a specific file instead:

```bash
cd backend
MONGODB_URI="mongodb+srv://..." npm run seed
MONGODB_URI="mongodb+srv://..." npm run seed -- path/to/db.json
```

The import is idempotent (records are upserted) and never modifies the source file.

## Troubleshooting

**API exits at start** — check `MONGODB_URI`, the Atlas IP allowlist and the database user rights.

**Website shows fallback content** — `NEXT_PUBLIC_API_URL` is wrong or the API is asleep (Render
free tier). The fallback catalogue is intentional so the interface still renders.

**Browser requests blocked** — add the exact frontend origin (no trailing slash) to `CORS_ORIGIN`.

**Emails not arriving** — set a verified sender and one provider key (`BREVO_API_KEY` or
`RESEND_API_KEY`), then check the API log for provider errors.

**Payments stay in demo mode** — set both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; live keys
require completed KYC.
