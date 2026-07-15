# EBC/JPFD Workforce CRM — Web

React + Vite + TypeScript frontend for the EBC/JPFD Workforce CRM. This app
contains **no business logic** — leave slot capacity, payroll figures,
rotation answers, and PDF generation are all computed by `ebc-crm-api`. Pages
call the API and render what comes back.

## Architecture

- **React 18 + Vite + TypeScript**, strict mode.
- **React Router v6** for routing, with a single `ProtectedRoute` gate.
- **TanStack Query** for all server data — no component fetches with raw
  `fetch`/`axios` directly; everything goes through `src/api/client.ts`.
- **Zustand** for local UI state (theme, sidebar/drawer open state).
- **Supabase Auth** (anon key only) for session management — the anon key is
  safe to expose because RLS and the backend protect the data.
- **6 fixed responsive breakpoints** (`useBreakpoint` hook): `xs < 375 | sm
  375–639 | md 640–767 | lg 768–1023 | xl 1024–1279 | 2xl ≥ 1280`. No raw CSS
  media queries in component files — everything reads `bp` from the hook.
- **No hardcoded colors** — every component takes a `t: ThemeTokens` prop
  sourced from `src/theme/tokens.ts`.

## Local setup

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# VITE_API_BASE_URL defaults to http://localhost:3001 (ebc-crm-api dev server)
npm install
npm run dev
```

Open `http://localhost:5173` — you should see the login page. Vite proxies
`/api/*` requests to `http://localhost:3001` in development (see
`vite.config.ts`), so `ebc-crm-api` must be running locally too.

Run `npm run check-env` at any time to see which required/optional
environment variables are set.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | yes | Base URL of `ebc-crm-api` (no trailing slash) |
| `VITE_SUPABASE_URL` | yes | Same Supabase project as the backend |
| `VITE_SUPABASE_ANON_KEY` | yes | Anon key — safe to expose, used only for Auth session management |
| `VITE_APP_NAME` | no | Display name |
| `VITE_APP_ENV` | no | `development` \| `production` |

## Connecting to the API

Every network call goes through `src/api/client.ts` (`apiGet`, `apiPost`,
`apiPatch`, `apiDelete`). The Axios instance attaches the current Supabase
session's JWT as a Bearer token on every request, retries once on a 401 by
refreshing the session, and signs the user out + redirects to `/login` if
the refreshed request still fails. Responses are unwrapped from the
`{ success, data, meta }` / `{ success: false, error }` envelope automatically
— hooks and pages just get `data` back, or the request throws the `ApiError`
shape.

## Running tests

```bash
npm test
```

`tests/integration/authFlow.test.ts` covers: an unauthenticated visit to a
protected route redirecting to `/login`, a successful login landing on the
protected area, and an invalid-credentials error surfacing on the login form.
Supabase Auth is mocked so no real network calls are made.

## Deploying to Vercel

1. Connect this repository to a new Vercel project.
2. Set `VITE_API_BASE_URL` (the deployed Railway API URL),
   `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in Vercel → Settings →
   Environment Variables.
3. Vercel runs `npm run build` (`tsc && vite build`) and serves `dist/`.
4. `vercel.json` adds the SPA rewrite (`/(.*) → /index.html`) and security
   headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
   Permissions-Policy).
