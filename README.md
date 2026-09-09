# Uychi

Real estate marketplace for Uzbekistan (rent and sale of flats, houses, and rooms). Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. Live at [uychi.site](https://uychi.site).

## What it does

- Public homepage with approved/active listings only, search and filters for both rent and sale
- "Near me" search using the browser's Geolocation API and a server-side distance sort — no third-party places/distance API
- Listing location picker with a satellite map (Mapbox when configured, Esri World Imagery free tiles otherwise) — every listing has coordinates, either pinned exactly or an approximate district/region centroid
- Photo-first listing cards with price-first emphasis; listing detail pages with a gallery
- Login-required actions: viewing owner contact details, uploading images, submitting listings, in-app messaging
- In-app buyer-owner messaging ("Message owner") as an alternative to revealing phone/Telegram contact directly
- Email/password login and registration, with optional "Continue with Google" sign-in
- Real email verification (link sent on registration) and password reset flows
- Optional Telegram-bot phone number verification from the profile page
- AI Uychi: an optional Gemini-powered chat assistant that understands natural-language search requests ("2-room flat in Chilonzor under $500") and returns real matching listings — never invents listings or prices
- Owner-only dashboard: pending listing moderation, user blocking, stats, drag-to-reorder, batch approve/reject, paginated listing management, and a full listing preview before approving
- Optional custom admin path (`ADMIN_PATH`) so the dashboard doesn't sit at the guessable default `/admin` in production
- User listing management: edit, delete, and active/rented/sold status controls
- PostgreSQL-backed user sessions
- Local VPS disk image storage (production default) with optional Supabase Storage or Cloudinary as alternatives

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Leaflet + Mapbox/Esri tiles for the location picker
- Vitest for the test suite

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SITE_URL`: public base URL, for example `https://uychi.site`
- `PUBLIC_CONTACT_EMAIL`: footer/contact page email
- `OWNER_EMAIL`: the single owner account email, checked server-side only

Optional variables:

- `ADMIN_PATH`: move the owner dashboard off the guessable default `/admin`, e.g. `/manage-x7k2`. Leave unset to keep it at `/admin`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: enables the "Continue with Google" button (see below)
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME`: enables Telegram-based phone verification on the profile page (see below)
- `GEMINI_API_KEY`: enables the AI Uychi chat assistant nav tab (see below)
- `GEMINI_MODEL` / `GEMINI_MODEL_FALLBACKS`: override the default Gemini model and its fallback chain
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: use Mapbox Satellite Streets tiles in the location picker instead of the free Esri fallback (see `.env.example` for why Mapbox specifically)
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` / `SUPABASE_STORAGE_BUCKET`: optional cloud image storage
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_UPLOAD_FOLDER`: optional alternative cloud image storage
- `ALLOW_LOCAL_UPLOADS`: set to `"true"` to store uploaded images on local disk (`public/uploads/listings`). This is the production default on a VPS with persistent disk; leave unset on ephemeral hosts (Render, etc.) where uploaded files would be lost on redeploy.
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS`: outgoing email via SMTP
- `RESEND_API_KEY`: outgoing email via Resend, used if SMTP isn't configured
- `EMAIL_FROM`: sender identity for outgoing emails

Important:

- Do not commit real secrets.
- `OWNER_EMAIL` is checked only on the server and is never exposed to the client.
- Image storage: configure exactly one of `ALLOW_LOCAL_UPLOADS=true` (local disk), Supabase Storage, or Cloudinary. Local disk is what production actually runs on (served directly by nginx, not proxied through Next.js — see `deploy/nginx-uychi.conf`); Supabase/Cloudinary remain supported if you'd rather not manage disk backups yourself.
- SMTP is used first for outgoing email when configured; Resend is used next if SMTP isn't set; if neither is configured, password reset/verification emails are logged to the server console instead of blocking the flow.

## Google Sign-In setup (optional)

"Continue with Google" is hidden automatically unless both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. To enable it:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create (or select) a project.
2. Under **APIs & Services → OAuth consent screen**, configure the consent screen (External is fine for most cases) and add your support email.
3. Under **APIs & Services → Credentials**, click **Create Credentials → OAuth client ID**, choose **Web application**.
4. Add an **Authorized redirect URI**: `${SITE_URL}/api/auth/google/callback` (for local dev: `http://localhost:3000/api/auth/google/callback`).
5. Copy the generated **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

Signing in with Google auto-verifies the account's email and links to an existing email/password account with the same address if one exists (no duplicate accounts).

## Telegram phone verification setup (optional)

The "Verify via Telegram" button on the profile page is hidden automatically unless `TELEGRAM_BOT_USERNAME` is set, and verification only actually completes once the bot process below is running with a matching `TELEGRAM_BOT_TOKEN`. To enable it:

1. Message [@BotFather](https://t.me/BotFather) on Telegram and send `/newbot`.
2. Follow the prompts to name the bot and choose a unique `@username`.
3. BotFather replies with an API token — put it in `TELEGRAM_BOT_TOKEN` in `.env`.
4. Put the bot's username (without the `@`) in `TELEGRAM_BOT_USERNAME` in `.env`. This is used to build the `https://t.me/<username>?start=...` link the site sends users to.
5. Run the bot as its own long-running process (separate from `npm run dev`/`npm start`):

```bash
npm run telegram-bot
```

How it works: a user saves a phone number on `/account`, then taps "Verify via Telegram". The site creates a short-lived one-time token and redirects to the bot's deep link. The bot asks the user to share their Telegram contact (a native button, not typed text — this is what actually proves the phone number), then marks that phone number verified on the account that started the flow. The token expires after 20 minutes and is single-use.

In production (e.g. the VPS deploy), run this as its own systemd service alongside the main app, so it keeps polling independently of app restarts.

## AI Uychi setup (optional)

The "AI Uychi" nav tab is hidden automatically unless `GEMINI_API_KEY` is set. To enable it:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Put it in `GEMINI_API_KEY` in `.env`.
3. Optionally set `GEMINI_MODEL` to override the default model, and `GEMINI_MODEL_FALLBACKS` (comma-separated) to override the fallback chain tried if the primary model is rate-limited or unavailable.

How it works: each message runs one extraction call that decides whether there's enough to search yet (asking one clarifying question if not), runs the resulting filters against the real listings search (no separate AI step touches the database), then one phrasing call turns the real results into a reply. AI Uychi never invents a listing, price, or address — it only describes what the actual search returned.

## Listing location & maps

Every listing has coordinates and a precision flag (`EXACT` for a pin placed via the location picker, `APPROXIMATE` for a district/region centroid). The location picker (`components/location-picker.tsx`) uses Leaflet with satellite tiles — no Google Maps. Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to use Mapbox Satellite Streets (real building/street labels); otherwise it falls back to Esri World Imagery (free, no key required, but no labels). Raw coordinates are only ever sent to a listing's own owner when editing it — public browsing only ever sees a rounded `distanceKm` for "near me" results.

## Local setup

1. Install packages

```bash
npm install
```

2. Run database migrations

```bash
npm run prisma:migrate -- --name init
```

3. Seed sample data

```bash
npm run prisma:seed
```

4. Start the app

```bash
npm run dev
```

5. Open the site

- Public site: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- Add listing: `http://localhost:3000/add-listing`
- Owner dashboard: `http://localhost:3000/admin` (or your `ADMIN_PATH` if set)

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run a production build
- `npm run test` — run the Vitest test suite
- `npm run prisma:migrate` — run Prisma migrations
- `npm run prisma:seed` — seed sample data
- `npm run telegram-bot` — run the Telegram phone-verification bot (separate long-running process)

One-off/ops scripts (not wired into `package.json`, run directly with `tsx`/`bash`):

- `scripts/backfill-listing-locations.ts` — geocode district/region centroids onto listings that predate the location picker; safe to re-run, never overwrites a listing that already has coordinates (`--apply` to write, otherwise dry-run)
- `scripts/normalize-districts.ts` — one-time district/region data cleanup
- `scripts/backup-uploads.sh` — daily cron snapshot of the local uploads directory to a separate location on the same disk (protects against accidental deletion, not against total disk loss)

## Testing

```bash
npm run test
```

Vitest unit tests cover the pure logic in `lib/` (formatting, validation, the admin-path helper, owner-check logic, etc.) — not a full end-to-end suite, but enough to catch regressions in business logic without a browser.

## Auth and moderation

- Browsing is public.
- Users must log in before:
  - viewing owner contact details
  - uploading listing images
  - submitting new listings
  - messaging a listing owner
  - using account pages
- Registering with email/password sends a verification link; the account works immediately either way, but `/account` shows a reminder banner until it's verified. Verification email delivery never blocks registration (best effort, logged on failure).
- Signing in with Google marks the email as verified automatically and links to a matching email/password account by email if one exists.
- Users can request password reset links from `/forgot-password`.
- If the logged-in email matches `OWNER_EMAIL`, the same normal login flow redirects that account to the owner dashboard.
- Normal users are redirected to `/account` after a direct login or register with no special next path.
- New listings are stored as `PENDING`.
- Only `APPROVED` listings (with `availabilityStatus` `ACTIVE`) appear on public pages — never `PENDING`, `REJECTED`, or blocked-user content, even accidentally via a shared query builder.
- Blocked users cannot log in through the normal user flow.
- Pending listing moderation, batch approve/reject, and user block/unblock are available only in the owner dashboard, only to the account matching `OWNER_EMAIL`.
- Users can edit or delete their own listings and mark approved listings as rented, sold, or active again.

## Public launch notes

- The site includes footer pages for About, Contact, Privacy, and Terms; sitemap and robots routes; shareable metadata for listing detail pages; noindex protection on auth, account, admin, and submission pages.
- Local disk (`public/uploads/listings`, served directly by nginx) is the production image storage default — see the `ALLOW_LOCAL_UPLOADS` note above. Supabase Storage and Cloudinary remain supported as optional alternatives if either is configured via env vars.
- `scripts/backup-uploads.sh` should run on a daily cron in production to snapshot uploads, since local disk has no built-in redundancy.
- For real public hosting, also configure an email provider (SMTP or Resend) before launch — without one, password reset and verification emails only reach the server console.

## Seed data

The seed includes:

- 12+ Uzbekistan listings across rent and sale
- flats, rooms, and houses
- USD and UZS prices
- approved, pending, and rejected moderation states
- verified demo account data
- real property photos for public cards
- legacy Nurafshan listings mapped safely into the new region/district structure

Seeding resets the sample data in your local database.
