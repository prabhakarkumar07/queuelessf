# QueueLess Web App

React/Vite app for QueueLess shop owners, admins, staff operators, customer self-service, and TV displays.

## Run Locally

```bash
npm install
npm run dev
```

The app expects the backend API at `http://localhost:8080` during local development.

Useful local routes:

- Business login: `/login`
- Customer login: `/login?account=customer`
- Customer portal: `/customer`
- Owner dashboard: `/dashboard`
- Staff console: `/staff`
- TV display: `/tv/:shopId`

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript and creates a production build.
- `npm run preview` previews the production build locally.
- `npm run lint` runs ESLint over `src`.

## Main Areas

- Customer portal with active token dashboard, shop discovery, queue join, live WebSocket tracking, appointments, history, reviews, rewards, and profile
- Dashboard and live queue controls
- Shop onboarding and service management
- Staff management and staff view
- Appointments, holidays, announcements, reviews, analytics, loyalty settings, and TV display

## Customer Portal Notes

The customer portal is a web client over the existing mobile/customer API contract. It does not introduce duplicate business logic or separate customer web endpoints. Authentication uses the same JWT/refresh token flow currently stored in localStorage by the web client.
