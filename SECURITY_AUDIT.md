# Security Audit — EV Training School backend

**Scope:** `backend/` Express API (routes, middleware, auth, payments, mailer, db storage).
**Status:** 23/23 automated tests pass. This audit is a manual code review; it does not replace a professional penetration test.

---

## 1. What is done well (strengths)

| Area | Finding |
|------|---------|
| Password storage | bcrypt with cost 10 (`routes/auth.js`, `db.js` seed) |
| Session tokens | JWT signed with `JWT_SECRET`, 7-day expiry |
| Secret generation | `config.js` auto-creates random `JWT_SECRET`/`CERT_SECRET` if missing and persists them |
| Email verification | One-time 32-byte random token; only the SHA-256 hash is stored; 24 h expiry; single-use; 60 s resend throttle; purchases blocked until verified (`EMAIL_NOT_VERIFIED`) |
| Password reset | One-time token, 1 h expiry, single-use, invalidated after use |
| Rate limiting | Login (20/15 min), register (10/15 min), verify-email (30/15 min), reset-password (20/15 min), contact (6/15 min), reset-request (6/15 min) — per IP |
| Auth errors | Generic "Incorrect email or password" — no enumeration on login |
| CORS | Only origins listed in `CORS_ORIGIN` are allowed; everything else rejected, including preflight |
| Security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin` |
| Proxy awareness | `app.set('trust proxy', 1)` so `req.ip` is the real client behind Render |
| Certificate integrity | HMAC-SHA256 over certificate fields, compared with `crypto.timingSafeEqual` |
| Razorpay integrity | Webhook/order signature verified with HMAC-SHA256 + timing-safe compare |
| Account safety | `disabled` flag blocks login; admin can disable accounts |
| Input validation | Email format, password ≥ 8 chars, message length, rating 1–5, name length, token format (`^[0-9a-f]{64}$`) |
| Email injection safety | `sendMail` builds JSON request bodies (Brevo/Resend), never raw SMTP headers |

---

## 2. Concerns and recommendations

### Medium risk

**A. Rate limiter is in-memory and resets on restart** (`middleware/rateLimit.js`)
Counters live in a `Map` and are wiped when the server restarts. Also not shared across multiple instances.
- *Recommendation:* For a single Render web service this is acceptable. If you scale to multiple instances or need persistence across deploys, switch to a Redis-backed rate limiter (e.g. `express-rate-limit` with a Redis store).

**B. Registration reveals whether an email already exists** (`routes/auth.js:57`)
Returns `409 "An account with this email already exists"`, which enables email enumeration.
- *Recommendation:* Acceptable tradeoff for a small school (helps users who mistype). If you want to close it, return a generic success and send a "if this account exists, a verification email was sent" style message instead.

**C. No account lockout after repeated failed logins**
Only IP-based rate limiting exists; a determined attacker can rotate IPs.
- *Recommendation:* Add a per-email failed-attempt counter that temporarily locks the account (e.g. 5 failures → 15 min lockout), reset on successful login.

**D. Potential lost-update on concurrent writes** (`db.js` read()/write() pattern)
`read()` returns a clone of the full in-memory cache and `write()` replaces the cache wholesale. Two concurrent requests that both read, modify, and write can overwrite each other's changes (last write wins).
- *Recommendation:* This is inherent to the `db.read()/db.write()` pattern. The per-model Mongoose migration (still outstanding) will eliminate it by doing atomic, document-level updates.

### Low risk

**E. `JWT_SECRET` / `CERT_SECRET` fallback to fixed strings** (`routes/auth.js:15`, `utils.js:12`)
If the env var were missing, tokens/certs would be signed with `'dev-secret'` / `'dev-cert-secret'`.
- *Mitigation:* `config.js` always guarantees both are set (auto-generates random values). Keep this as defense-in-depth but do not rely on the fallback.

**F. Password complexity is length-only (≥ 8 chars)** (`routes/auth.js:52`)
No requirement for uppercase, digits, or symbols.
- *Recommendation:* Acceptable per NIST guidance (length > complexity). Consider adding a breach-password check if you want stronger protection.

### Informational

**G. Demo payment mode when Razorpay keys absent** (`routes/payments.js:9`)
`paymentMode()` returns `'demo'` unless both Razorpay keys are set. No real money moves. Ensure you explicitly opt into live mode only after KYC and testing.

**H. Secrets file** (`backend/.env`)
Contains `JWT_SECRET`/`CERT_SECRET` and optionally Razorpay/email keys. It is git-ignored — keep it out of zips, backups, and the repository. Rotate Razorpay test keys if they were ever shared.

**I. CSRF**
Not applicable: this is a stateless JWT API (no session cookies). CORS origin restriction is the primary cross-site control. Ensure `CORS_ORIGIN` is set to your real frontend domain in production.

---

## 3. Not covered by this audit

- Frontend (Next.js) client-side code
- Dependency vulnerabilities (`npm audit` not run in sandbox)
- MongoDB Atlas / Render / Vercel platform configuration
- Penetration testing, fuzzing, or authenticated scanning

---

## 4. Recommended next steps

1. Set `CORS_ORIGIN` to your production frontend domain before deploying.
2. Rotate any Razorpay test keys that may have been shared; never commit `backend/.env`.
3. Configure email (Brevo/Resend) so verification and reset emails are actually delivered.
4. Run `npm audit` in `backend/` and `frontend/` and fix high/critical findings.
5. Complete the per-model Mongoose migration (removes the read()/write() lost-update risk).
6. Consider a professional penetration test before handling live payments.
