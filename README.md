# TyphoonWatch: Disaster & Typhoon Reporting Platform

Community platform where residents report typhoon damage, flooding, landslides and stranded families
with a photo and GPS location. Responders (admins) verify each report, post status updates and publish
typhoon advisories. Verified reports appear on a live public map.

**Stack:** React + TypeScript + Vite, Tailwind CSS v4, Supabase (PostgreSQL, Auth, RLS, Storage, Realtime),
Leaflet + OpenStreetMap, Recharts.

## Features

| Area | What it does |
| --- | --- |
| Resident | Register / sign in, submit a report (type, severity, details, barangay, GPS or map pin, photo), track status in **My Reports**, delete a report while it is still pending |
| Public | Home page with live stats and latest verified reports, **Live Map** with severity pins and filters, **Advisories** page with typhoon wind signals |
| Admin | **Dashboard** (14-day trend, status, type, severity and barangay charts), **Reports** moderation (verify, reject, respond, resolve, notes for the reporter, delete, search, CSV export), **Advisories** (publish, archive, delete) |
| Security | Row Level Security on every table. Residents only see verified reports and their own. Only admins can change status or publish advisories. Residents cannot promote themselves to admin |
| Realtime | Map, home and report lists refresh automatically when a report changes |

## Setup

1. **Install**
   ```bash
   npm install
   ```
2. **Create a Supabase project** at https://supabase.com
3. **Run the schema:** open *SQL Editor*, paste the whole contents of `supabase/schema.sql`, run it.
   This creates the tables, RLS policies, the `report-photos` storage bucket and enables Realtime.
4. **Add your keys:** copy `.env.example` to `.env` and fill in the values from
   *Project Settings → API*.
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Run it**
   ```bash
   npm run dev
   ```
6. **Make yourself admin:** register in the app, then run this in the SQL Editor with your email:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Sign out and in again. You will see the **Admin** tab.

> Tip for testing: in *Authentication → Providers → Email*, turn off "Confirm email" so new accounts can
> sign in immediately.

## Customize

- **Map center:** `src/lib/constants.ts` → `MAP_CENTER` (default is San Jose, Occidental Mindoro).
- **Incident types, severities, statuses:** `src/lib/constants.ts` (also update the `check` constraints in
  `supabase/schema.sql` if you add new values).
- **Colors and fonts:** `src/index.css` and the Tailwind classes in components.

## Project structure

```
supabase/schema.sql          Database, RLS, storage, realtime
src/lib/                     Supabase client, types, constants, helpers
src/context/AuthContext.tsx  Session + profile + role
src/hooks/                   useReports (with realtime), useAdvisories
src/components/              Layout, guards, badges, maps, cards, UI kit
src/pages/                   Home, Map, Advisories, Report, My Reports, Auth
src/pages/admin/             Dashboard, Reports moderation, Advisories
```

## Deploy

`npm run build` creates a static `dist/` folder. Host it on Vercel, Netlify or Cloudflare Pages and set the
same two `VITE_` environment variables. Because the app uses client-side routing, enable the SPA fallback
(all routes serve `index.html`).

## Notes

- Map tiles come from OpenStreetMap's public tile server, which is fine for development and small
  deployments. For heavy production traffic, use a tile provider with an API key.
- Photos are stored in a **public** bucket so they can show on the public map. Only verified reports are
  publicly listed, but anyone with a photo URL can open it.
- This is a community reporting tool. It does not replace official emergency services.
