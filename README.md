# SDA Migori Central — English & Kiswahili Church Website

A server-rendered church website for **Seventh-day Adventist Church Migori Central** with a secure staff dashboard, built with Node.js, Express 5, plain HTML/CSS/JavaScript and the SQLite engine that ships with Node (`node:sqlite`). No frontend framework, no external database, no third-party trackers, no runtime build step.

---

## 1. What is included

### Public website

| Page | Path | Notes |
| --- | --- | --- |
| Home | `/` | Announcement bar, hero, welcome, service times, about, sermons, ministries, events, testimonies statement, gallery, giving guidance, prayer CTA, newsletter, footer |
| About | `/about` | Story, vision, mission, beliefs, leadership preview |
| Leadership | `/leadership` | Placeholder profiles with a clear "content pending" state |
| Ministries | `/ministries` | Ministry cards from the database |
| Sermons & Media | `/sermons` | Search, speaker filter, newest/oldest sort, external video/audio links only |
| Events & Conferences | `/events` | Upcoming and past events with dates in Africa/Nairobi time |
| Gallery | `/gallery` | Responsive image grid with accessible lightbox |
| Online Giving | `/give` | Shows payment details **only** when a church admin saves a method and marks it verified; otherwise it explains how to ask the church |
| Prayer Requests | `/prayer` | Confidential request form with optional name/contact and consent |
| Contact | `/contact` | Contact form, call/email/WhatsApp/location blocks only when real values are set |
| Plan Your Visit | `/visit` | Visit form, what to expect, service times, map when configured |
| Privacy Policy | `/privacy` | Data handling, storage, retention and rights |
| 404 | any unknown path | Custom page, `noindex`, HTTP 404 |

Global features on every page:

- **Bilingual English / Kiswahili** (`EN` / `SW`). The switch translates navigation, buttons, forms, validation messages, service and event information, metadata and the footer. The preference is stored in a cookie and `localStorage` and survives reloads.
- **Light / dark theme** with a pre-paint boot script (no flash), persisted in `localStorage`, honouring `prefers-color-scheme` on first visit.
- **Responsive layout** with a mobile navigation dialog, keyboard trapping, focus restoration and Escape-to-close.
- **Accessibility**: skip link, semantic landmarks, labelled forms with inline error text, `aria-live` statuses, visible focus rings, reduced-motion support, alt text on all images, heading hierarchy.
- **SEO**: unique titles and descriptions per page, canonical URLs when `SITE_URL` is set, Open Graph/Twitter cards, `Church` and `WebSite` JSON-LD, `sitemap.xml`, `robots.txt`, clean URLs, lazy-loaded responsive images (WebP + JPG at 480/800/1200/1600 px).
- **Security headers**: strict CSP with per-request nonce, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, HSTS in production.

### Staff dashboard (`/admin`)

- Server-side authentication with **scrypt** password hashing and timing-safe verification.
- Database-backed sessions (HttpOnly, SameSite=Lax, Secure in production) and CSRF double-submit tokens.
- Two roles:
  - **Administrator** — full access.
  - **Editor** — content create/update, inbox viewing and status changes; no deletes, settings, users, subscribers or audit log.
- Modules:
  - **Overview** — counters, a notice when illustrative rows remain, latest prayer requests and messages.
  - **Content** — announcements, service times, sermons (with video/audio URL fields), events, ministries, gallery.
  - **Messages** — prayer requests, visit requests, contact messages with status workflow and detail view.
  - **Subscribers** — newsletter list with CSV export.
  - **Settings** — church identity, contact details, social links, giving methods (with an explicit **Verified** checkbox; only verified methods appear publicly).
  - **Team** — create/edit/remove staff accounts (administrators only).
  - **Audit log** — read-only record of sign-ins and content changes.
  - **My account** — profile summary and password change (invalidates other sessions).
- Pagination, search, status filters, server-side validation with field-level errors, image upload with Sharp re-encoding (JPEG + WebP, max 6 MB, resized to 1600 px), and CSV export.

---

## 2. Content authenticity — this deployment

The site is populated only from the church's **public channels** (its Facebook page, YouTube channel and Adventist directory listing). Nothing was invented. Fields the church has not published remain empty and are rendered as honest "to be announced" states:

| Verified and published | Source |
| --- | --- |
| Name: Seventh-day Adventist Church Migori Central | Church Facebook/YouTube |
| Motto: "Where Christ is exalted, People are Cherished and Truth is Treasured" | Church Facebook page |
| Denomination, location and address (Migori–Isebania Highway, opposite Migori Teachers' College, P.O. Box 538-40400, Migori, Kenya) | Adventist directory listing and Facebook contact info |
| Email `sdamigoricentral@gmail.com`; Facebook, YouTube and TikTok links | Facebook contact info and official channel/account |
| Wednesday prayer service, 17:30 | Public church listing |
| Six recent sermons with title, speaker, date, Scripture (where shown) and YouTube link | Church YouTube channel |
| Ministries named in public announcements (Sabbath School, music, family life, prayer, media) | Church posts and streams |

**Not published anywhere yet — deliberately left blank:**

- Sabbath School and Divine Service **start times** (shown as "To be announced" with an explanatory note).
- Phone, WhatsApp, senior pastor and leadership names, founding year, vision/mission statements (leadership page and about page say the content is pending).
- Giving channels — `/give` shows only the "being finalised" state; no Paybill, Till, bank account or transaction reference exists in the project.
- Upcoming events — the events table starts empty; the page shows its empty state.
- Real congregation photographs — only the six sermon thumbnails come from the church's YouTube channel; the gallery, hero, welcome and ministry images are illustrative and labelled as such.

The Adventist directory still lists `info@sdamigoricentral.org` and `sdamigoricentral.org`; that domain no longer resolves, so the site uses the Gmail address published on the church's Facebook page instead.
- Testimonies — none are published.

Rules that remain in force:

- Every church field is editable in **Dashboard → Settings → Church profile**. Empty fields are hidden rather than rendered as dead links.
- Giving methods appear only after an administrator saves them and ticks **Verified**.
- Sermon cards link only to URLs entered in the dashboard; no statistics are fabricated.
- Prayer requests are private and never rendered on public pages.
- No payment credentials are stored in frontend code or committed to the repository.

---

## 3. Requirements

- **Node.js 22.5 or newer** (needed for `node:sqlite`). Tested on Node 24.
- npm 10+.
- No external database or service is required.

## 4. Quick start

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

For local development, set `NODE_ENV=development` in `.env` (the example targets production). Generate a session secret and put it in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set at least `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in `.env`. Then start:

```bash
npm run dev     # restart on file changes
# or
npm start       # normal start
```

- Website: <http://localhost:3000>
- Dashboard: <http://localhost:3000/admin>

On first start the database is created at `data/church.sqlite`, the schema is applied, the administrator account is created from `.env`, and the church profile plus the verified public content (announcements, service rows, sermons, ministries, gallery) are seeded. Sign in to complete the fields the church still needs to confirm.

> The administrator is created **once**, on first start, only if the `users` table is empty. Changing `ADMIN_PASSWORD` later does not overwrite the stored password — use **My account** in the dashboard.

---

## 5. Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | no | `3000` | HTTP port. |
| `HOST` | no | `0.0.0.0` | Bind address. |
| `NODE_ENV` | production | `development` | Enables Secure cookies, HSTS, immutable asset caching and strict secret checks in production. |
| `SITE_URL` | production | *(request host)* | Public origin without trailing slash, e.g. `https://gracechurch.example.org`. Used for canonical URLs, Open Graph images, sitemap and robots. |
| `SESSION_SECRET` | production | — | Random string of at least 32 characters. Required in production; without it form tokens and sessions reset on restart. |
| `SESSION_HOURS` | no | `8` | Dashboard session lifetime in hours. |
| `ADMIN_NAME` | no | `Church Administrator` | Display name of the first administrator. |
| `ADMIN_EMAIL` | first start | — | Email for the first administrator. |
| `ADMIN_PASSWORD` | first start | — | Password for the first administrator (minimum 10 characters recommended). |
| `TRUST_PROXY` | behind proxy | `0` | Set to `1` when running behind Nginx/Caddy so client IPs and HTTPS are detected correctly. |
| `DEMO_BANNER` | no | `1` | When truthy, the server logs a reminder that sample content is visible. |

Secrets belong only in `.env` (git-ignored) or your host's environment settings. Never commit `.env`.

---

## 6. Database

- Engine: SQLite through Node's built-in `node:sqlite` (`DatabaseSync`), WAL journal mode, foreign keys on.
- File: `data/church.sqlite` (plus `-wal`/`-shm` while running).
- Schema is created with `CREATE TABLE IF NOT EXISTS`; there is no separate migration step for v1.
- Seeding is idempotent: sample content is inserted only when the relevant table is empty; `settings` rows are created only when missing.
- Uploaded images are re-encoded into `uploads/` and served from `/uploads`.

**Backup:** stop the server (or run `PRAGMA wal_checkpoint(TRUNCATE)`), then copy `data/church.sqlite` and the `uploads/` directory. Both are git-ignored and must be included in your deployment backup strategy.

To start over in development, stop the server and delete `data/church.sqlite*`; the next start recreates and reseeds the database.

---

## 7. Deployment

### 7.1 Prepare

1. Set `.env` (or host environment):
   - `NODE_ENV=production`
   - `SITE_URL=https://your-domain.example`
   - `SESSION_SECRET` — 48+ random bytes
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — strong values
   - `TRUST_PROXY=1` if behind a reverse proxy
2. `npm ci --omit=dev` on the server.
3. Ensure `data/` and `uploads/` are writable by the service user and persisted across deploys.

### 7.2 Reverse proxy with HTTPS (Caddy example)

```caddy
church.example.org {
    encode gzip
    reverse_proxy 127.0.0.1:3000
}
```

Caddy obtains and renews TLS automatically. If you use Nginx, forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto`, and enable TLS (the app sends HSTS in production, so HTTPS must actually work).

### 7.3 Process manager (systemd example)

```ini
[Unit]
Description=Church website
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/church-website
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
# Use EnvironmentFile=/srv/church-website/.env for secrets

[Install]
WantedBy=multi-user.target
```

### 7.4 After the first deploy

- Sign in at `/admin` and **change the administrator password** (My account).
- Confirm the church profile in Settings → Church profile (address, email and social links are pre-filled; add phone, WhatsApp and pastor when confirmed).
- Add the Sabbath School and Divine Service start times, then remove the "being confirmed" notes by clearing the blank rows.
- Add real events, ministry photos and congregation photos; replace the illustrative gallery images.
- Add giving methods only after the church confirms them, and tick **Verified**.
- Review the privacy policy wording with the church.
- Confirm `SITE_URL`, `robots.txt` and `sitemap.xml` use the real domain, and that `/admin` responds with `X-Robots-Tag: noindex`.

Health check: `GET /healthz` returns `{"ok":true}` when the database is reachable.

---

## 8. Information still needed from the church

The site is deliberately free of unverified facts. To complete it, collect and confirm:

1. **Sabbath times** — Sabbath School and Divine Service start times, duration and any second service.
2. **Contact** — phone and WhatsApp number in international format; confirm the postal address and map pin.
3. **Leadership** — senior pastor, elders and ministry leaders: names, correct titles, short biographies, photos and consent to publish.
4. **History and statements** — year founded, milestones, and approved vision, mission and full statement of faith.
5. **Events** — dates, times, venues, descriptions and posters.
6. **Giving** — verified M-Pesa Paybill/Till or bank details, exact account names and official guidance. Enter these in the dashboard only; never commit them to code.
7. **Photos** — real congregation and building photos with permission, replacing the illustrative images.
8. **Testimonies** — written consent from each person before publishing anything.
9. **Social links** — Facebook, YouTube and TikTok are configured from the church's official accounts; add Instagram only if the church uses it.
10. **Domain and email** — production domain for `SITE_URL`, and a mailbox to receive enquiries (see limitations).

---

## 9. Security and privacy summary

- Passwords: scrypt (`N=16384`, `r=8`, `p=1`, 64-byte key), random salts, timing-safe comparison.
- Sessions: random 256-bit token in an HttpOnly cookie; only its SHA-256 hash is stored; expiry checked server-side; hourly cleanup.
- CSRF: double-submit token required on every state-changing dashboard request; same-origin checks on public and admin POSTs.
- Public forms: HMAC-signed form token (minimum 3 seconds, maximum 4 hours), hidden honeypot field, per-IP rate limiting, consent required, IP addresses stored only as SHA-256 hashes.
- Uploads: MIME and dimension checks, Sharp re-encode (strips metadata), size limit, random filenames, dotfiles denied.
- Database: parameterised queries throughout; resource whitelist for the admin API; role checks on every route.
- Audit log records sign-ins, failed sign-ins, content changes, settings changes, user management and password changes.
- Prayer requests and contact details are never published; only staff can read them.
- No third-party analytics, advertising or tracking scripts are loaded.

---

## 10. Project structure

```
server.js                 Express app: routes, headers, public forms, sitemap, 404/500
src/
  config.js               Environment loading, paths, placeholder defaults
  db.js                   Schema, WAL setup, idempotent seeding, settings helpers
  passwords.js            scrypt hashing and verification
  security.js             Sessions, CSRF, form tokens, rate limits, audit, hashing
  validate.js             Server-side validation for every public form
  i18n.js                 Locale detection, dictionaries, interpolation
  locales/en.json         English UI strings
  locales/sw.json         Kiswahili UI strings
  layout.js               HTML document, meta/OG/JSON-LD, header/footer, lightbox
  components.js           Shared UI: header, nav, footer, buttons, icons
  queries.js              Read queries for public pages
  admin.js                Admin REST API, resources, roles, uploads, exports
  pages/
    home.js               Home page sections
    about.js              About and Leadership
    listings.js           Ministries, Sermons, Events, Gallery
    forms.js              Prayer, Contact, Plan Your Visit
    misc.js               Giving, Privacy, 404, error
public/
  admin.html              Dashboard shell
  assets/css/site.css     Public design system and responsive layout
  assets/css/admin.css    Dashboard design system
  assets/js/site.js       Navigation, theme, language, filters, lightbox, forms
  assets/js/admin.js      Dashboard SPA (sessions, CRUD, settings, team)
  assets/fonts/           Self-hosted Fraunces and Manrope (woff2)
  assets/img/             Responsive WebP/JPG photography, OG image, icons
scripts/optimize-images.js  Regenerates responsive images from vibe_images/
data/                     SQLite database (created at runtime, git-ignored)
uploads/                  Dashboard image uploads (created at runtime, git-ignored)
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Run the server. |
| `npm run dev` | Run with `--watch` for development. |
| `npm run check` | Syntax-check `server.js`. |
| `npm run optimize-images` | Rebuild responsive WebP/JPG variants from `vibe_images/`. |

---

## 11. Known limitations

- **No email delivery.** Contact, prayer, visit and newsletter submissions are stored in the database and shown in the dashboard; the server does not send email notifications. Add an SMTP/API integration before relying on email alerts.
- **No payment processing.** Giving is informational only. The church enters its own verified details; the site never handles transactions or stores payment credentials.
- **No media hosting or upload for sermons.** Sermons accept external video/audio URLs (for example an unlisted YouTube link). There is no transcoding or file hosting.
- **Single-instance SQLite.** Appropriate for a single church site; it is not designed for horizontal scaling or high write concurrency.
- **Images are illustrative placeholders.** Replace them with licensed photos of the real congregation.
- **Testimonies are not managed in the dashboard.** The site publishes a consent statement and routes stories through the contact form; publishing a testimony requires adding it deliberately.
- **Kiswahili coverage** applies to the interface and validation messages. Church-entered content uses separate English and Kiswahili fields with fallback; incomplete translations fall back to the other language.
- **Browser testing** covered page rendering, forms, filters, theme, language, lightbox, admin CRUD, auth and CSRF through DOM and network inspection. Pixel-perfect visual QA on physical devices should still be done before launch.
