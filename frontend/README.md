# EV Academy — frontend

Next.js application for the EV Academy training platform.

## Run

```bash
npm install
printf "NEXT_PUBLIC_API_URL=http://localhost:5050\n" > .env.local
npm run dev
```

Open http://localhost:3000. The Express API must run separately (see `../backend`).

## Structure

- `app/(public)` — marketing pages and the programme catalogue
- `app/(auth)` — login, registration, verification and password reset
- `app/student` — student dashboard, learning, bookings, certificates, profile
- `app/admin` — admin dashboard and management screens
- `app/checkout`, `app/verify-certificate` — enrolment and the public registry
- `components/layout` — navigation and footer
- `components/interactive` — hero, system explorer, configurator, counters, reveals
- `components/ui` — reusable primitives
- `lib/api.ts` — typed API client
- `lib/catalogue.ts` — fallback programme data used when the API is offline

## Design system

Defined in `app/globals.css`: an ink/carbon palette with a single electric accent, wide-tracked
uppercase labels (`.eyebrow`), precision display type (`.display`), hairline panels, grid fields
and cut corners. Motion comes from Framer Motion and respects `prefers-reduced-motion`.

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm start        # serve the build
npm run lint     # ESLint
```
