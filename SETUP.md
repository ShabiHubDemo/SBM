# Setup — Safa Baitul Maal application

The public website runs on its own with no database. Everything below is only
needed for the admin application, which is being added on top of it.

## 1. Prerequisites

- Node.js 20 or newer (this machine has 22.17.0)
- A PostgreSQL database. A free [Neon](https://neon.tech) or
  [Supabase](https://supabase.com) instance is enough to start.

### Windows: two things to fix first

**Controlled Folder Access** blocks `node.exe` from writing inside
`OneDrive\Documents`, which breaks `npm run`, Prisma migrations and file
uploads. Either allow Node, in an Administrator PowerShell:

```powershell
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\nodejs\node.exe"
```

…or, better, **move the project out of OneDrive** — for example to
`C:\dev\safa-baitul-maal`. OneDrive syncing `node_modules` and an upload folder
causes slow and intermittent failures regardless of the Defender setting.

## 2. Install

```bash
npm install
```

## 3. Environment

```bash
cp .env.example .env
```

Fill in, at minimum:

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Neon requires `?sslmode=require`. |
| `AUTH_SECRET` | Signs the session cookie. At least 32 characters. |
| `SEED_ADMIN_EMAIL` | The first administrator's address. |
| `SEED_ADMIN_PASSWORD` | Their initial password, at least 12 characters. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

`.env` is git-ignored. Never commit it, and never move a secret to a
`VITE_`-prefixed variable — anything with that prefix is compiled into the
public JavaScript bundle.

## 4. Database

```bash
npm run db:generate   # generate the Prisma client
npm run db:migrate    # create the tables
npm run db:seed       # load the existing website content
```

The seed is **not** demo data. It imports the programmes, appeals, stories,
photographs, impact figures and settings already in `src/data` — material the
organisation has published itself — so the CMS starts with the real content.

It creates **no donations, donors, volunteers or messages**. Those are real
people's records and only ever come from real submissions.

## 5. Run

```bash
npm run dev
```

This starts both processes:

- the website on <http://localhost:5173>
- the API on <http://localhost:3000>

Vite proxies `/api` to the server, so both share one origin and the session
cookie is not a cross-site cookie.

Check the API is up:

```bash
curl http://localhost:3000/api/health
```

## 6. Admin

Sign in at <http://localhost:5173/admin/login> with the seeded address and
password. **Change that password immediately**, then remove
`SEED_ADMIN_PASSWORD` from `.env`.

Roles and what each may do are defined in
[`server/src/auth/permissions.ts`](server/src/auth/permissions.ts):

| Role | Scope |
| --- | --- |
| `SUPER_ADMIN` | Everything, including managing administrators |
| `ADMIN` | All content, campaigns, donations, volunteers, settings, audit log |
| `EDITOR` | Content only — stories, gallery, programmes, impact figures |
| `FINANCE` | Donations, donors, documents, exports |
| `VOLUNTEER_MANAGER` | Volunteer applications, messages, newsletter |

## 7. Payments

Payments are **off** until a provider is configured. While
`PAYMENT_PROVIDER` is empty, the donation form behaves exactly as it does
today: it collects an intent, shows a summary, and hands off to the
organisation's existing platform at `safadonations.org`.

To connect a provider later, set `PAYMENT_PROVIDER`, `PAYMENT_KEY_ID`,
`PAYMENT_KEY_SECRET` and `PAYMENT_WEBHOOK_SECRET`.

A donation is only ever marked `SUCCESS` by a server-side webhook whose
signature has been verified. Nothing the browser reports can set that status,
and card details are never collected or stored by this application.

## 8. Production build

```bash
npm run build          # typecheck, then build the frontend into dist/
npm run db:deploy      # apply migrations (no prompts)
npm start              # run the API
```

Serve `dist/` as static files with an SPA fallback to `index.html` — the
configs in `public/_redirects`, `vercel.json`, `public/.htaccess` and
`deploy/nginx.conf.example` all do this.

## 9. Deployment notes

- Set `NODE_ENV=production` and a real `APP_ORIGIN`; session cookies are only
  marked `secure` in production.
- Put the app behind HTTPS. `trust proxy` is enabled in production so `req.ip`
  and secure cookies work behind a reverse proxy.
- `uploads/` holds user-uploaded images and documents. Back it up with the
  database, or move it to object storage.
- Back up the database before every migration. Donations and audit logs are
  never hard-deleted, but a bad migration is still a bad migration.
