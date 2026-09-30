# Safa Baitul Maal — website

Front-end for the Safa Baitul Maal website. React 18, Vite 5, TypeScript, plain
modern CSS, React Router. No UI framework, no animation library, no CSS
framework — three runtime dependencies in total.

## Running it

```bash
npm install
npm run dev        # development server
npm run build      # typecheck, then production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # types only
```

The dev server prints a URL — usually <http://localhost:5173/>. Open that.

In VS Code you can also use **Terminal → Run Task…**, which has ready-made
entries for the dev server, a production build, a preview and a typecheck.

> **Do not use VS Code's "Go Live" button on this project.** Live Server hands
> files to the browser untouched, which breaks it in two ways: it cannot compile
> `/src/main.tsx` (TypeScript and JSX), so you get a blank page; and it has no
> single-page-app fallback, so `/impact` and every other route return
> `Cannot GET /impact`. No Live Server setting fixes either — use `npm run dev`
> while working, and `npm run preview` to check the production build. Both serve
> routes correctly, as every real host will.

> **If `npm run build` or `npm run dev` fails with `ENOENT`** while writing
> `vite.config.ts.timestamp-*.mjs` — see
> [Known environment issue](#known-environment-issue-windows) below. It is a
> machine setting, not a problem with the project.

## How the project is organised

```
public/img/        photographs and the logo (organisation-owned assets)
src/data/          all editable content — the single source of truth
src/types/         TypeScript shapes for every content structure
src/components/    reusable UI
src/pages/         one file per route
src/hooks/         useSeo, useReveal, useCountUp, useLockBodyScroll
src/utils/         formatting, validation, the form-submission adapter
src/styles/        tokens.css (design tokens) and global.css
```

### Editing content

Nothing in `src/components` or `src/pages` contains copy that changes often.
To update the site, edit the matching file in `src/data`:

| File               | What it controls                                          |
| ------------------ | --------------------------------------------------------- |
| `organization.ts`  | Name, mission, vision, values, phone, email, offices, socials |
| `impact.ts`        | Impact figures, current targets, context figures           |
| `programs.ts`      | The eight areas of work shown on Our Work                  |
| `campaigns.ts`     | Appeals, targets, suggested amounts, donation links        |
| `stories.ts`       | Activity reports and news items                            |
| `gallery.ts`       | Gallery photographs and the homepage hero image            |
| `voices.ts`        | Video testimonials                                         |
| `transparency.ts`  | Transparency section and the four ways to get involved     |
| `policies.ts`      | Privacy, terms and refund policy text                      |
| `navigation.ts`    | Header and footer menus                                    |

Every content type carries a `provenance` field — `'verified'` for material the
organisation has published, `'placeholder'` for structure waiting on real
content.

### Rules the content follows

These are deliberate and worth preserving:

- **No invented facts.** Every figure, address, phone number, social account and
  campaign target on the site comes from material Safa Baitul Maal publishes
  itself. Where something is not yet published — the annual report, registration
  and 80G details — the page says so rather than implying it exists.
- **Figures always carry their context.** A number is shown with the period or
  programme it belongs to, and achieved figures are kept visually separate from
  targets.
- **No fabricated progress bars.** `Campaign.raised` is `null` because this site
  has no live feed from the donation platform. Set it and the progress bar
  renders automatically; leaving it null shows the published target alone.
- **No beneficiary stories are written for people.** Video testimonials are
  linked, not paraphrased. Where an update exists only as a video, the story page
  links to it instead of inventing a narrative.
- **No stock photography presented as our work.** Every photograph is the
  organisation's own, and alt text describes what is actually in the frame.

## Donations

`/donate` collects a donation intent — amount, frequency, programme, contact
details — validates it, shows a summary, and then hands off to the
organisation's donation platform at `safadonations.org`, where the payment is
actually taken.

**This site never processes payments and never stores card, UPI or bank
details.** It does not report a donation as successful, because it has no way to
know that. When a payment gateway is integrated, the handoff in
`src/components/DonationForm.tsx` is the place to replace.

## Deploying

`npm run build` produces `dist/`. Upload its contents to the web root.

**The one thing that must be configured:** this is a single-page app, so the
server has to serve `index.html` for any path that is not a real file.
Without that rule, `/about` works when you click to it but returns 404 on a
hard refresh or when someone opens a shared link.

Configuration for the common hosts is already in the repository:

| Host                     | File                                                   |
| ------------------------ | ------------------------------------------------------ |
| Netlify                  | `public/_redirects` (copied into `dist/` by the build) |
| Vercel                   | `vercel.json`                                          |
| Apache / cPanel          | `public/.htaccess` (copied into `dist/` by the build)  |
| Nginx                    | `deploy/nginx.conf.example`                            |

Each also sets long cache lifetimes on the hashed files in `/assets/`, a short
one on images, and `no-cache` on `index.html` — without that last rule visitors
keep loading an old build after a deploy.

Two things to do once a domain is live:

- Uncomment the HTTPS redirect in `.htaccess`, or enable it on your host.
- Check that `https://www.safabaitulmaal.org/og-image.jpg` resolves, since the
  social preview tags point at that absolute URL.

## Connecting a backend

Forms post through one adapter, `src/utils/submit.ts`:

- Set `VITE_API_BASE_URL` and submissions are `POST`ed as JSON to
  `/donation-intents`, `/volunteers` and `/contact-submissions`, and the real
  response decides what the visitor is told.
- Leave it unset — the current state — and each form falls back to a pre-filled
  email so the enquiry still reaches the team. No form ever claims a submission
  succeeded when nothing was transmitted.

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.org/api/v1
```

Never put secrets or API keys in a `VITE_`-prefixed variable: everything with
that prefix is compiled into the JavaScript bundle and is public.

## Still needed from the organisation

- Trust registration number, 80G / 12A details and any certifications, for the
  transparency section and the footer (`src/data/transparency.ts`).
- The annual report and audited accounts, or a link to them.
- Written long-form copy for the activity reports that currently exist only as
  video (`body` in `src/data/stories.ts`).
- Confirmation of the official Instagram and YouTube accounts to link.
- Whether the Bangalore office address should be published.

## Known environment issue (Windows)

If `npm run` scripts fail with `ENOENT` when creating files in this folder,
the cause is **Windows Defender Controlled Folder Access**. It protects
`Documents` (including `OneDrive\Documents`) and only allows writes from
allow-listed applications. `npm run` executes scripts through `cmd.exe`, so
`node.exe` is not covered by the allow-list and cannot create files — even
though the same command works when run directly from PowerShell.

Fix it one of these ways:

1. **Allow Node.** Windows Security → Virus & threat protection → Ransomware
   protection → Controlled folder access → Allow an app through Controlled
   folder access → add `C:\Program Files\nodejs\node.exe`. (PowerShell:
   `Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\nodejs\node.exe"`,
   run as Administrator.)
2. **Move the project** out of `OneDrive\Documents` — for example to
   `C:\dev\safa-baitul-maal`. This is worth doing anyway: OneDrive syncing
   `node_modules` is slow and causes intermittent build problems.

Until then, run Vite directly from PowerShell, which bypasses the `cmd.exe` shim:

```powershell
node node_modules/vite/bin/vite.js          # dev server
node node_modules/vite/bin/vite.js build    # production build
node node_modules/vite/bin/vite.js preview  # serve the build
npx tsc --noEmit                            # typecheck
```
