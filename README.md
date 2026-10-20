# SMART HRM — SaaS starter

Starter full-stack app matching the supplied SMART HRM references: React/Vite frontend, Node.js/Express API, Supabase Auth/Postgres, role-based login, prospect demo-request registration, approval routing, KPI, attendance geofencing, and HR modules.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database/Auth: Supabase (Postgres + Supabase Auth)
- API verifies Supabase JWT; never expose service-role key in the browser.

## Run
1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Copy `.env.example` to `.env` in `server/` and fill values.
4. `cd server && npm install && npm run dev`
5. In another terminal: `cd client && npm install && npm run dev`
6. Open Vite URL. Create users in Supabase Auth, then add matching `profiles` rows with role `hrd`, `manager`, `director`, or `employee`. For real deployment, implement invite/onboarding and tenant provisioning.

## Important production work
This is a runnable starter scaffold, not a production-certified HRIS. Before real employee data: add RLS tests, tenant isolation tests, audit logging, rate limits, CSRF/CORS policy, email verification/reset flows, file storage policies, robust attendance anti-spoofing, payroll compliance, backups, and security review. Configure company approval chains in the `approval_routes` table. Demo requests are prospects only and do not create tenant accounts automatically.
