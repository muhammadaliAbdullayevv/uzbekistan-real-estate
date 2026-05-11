# Uzbekistan Rentals

Real estate marketplace for Uzbekistan. Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## What it does

- Public homepage with approved active listings only
- Search and filters for both rent and sale listings
- Photo-first cards with price-first emphasis
- Listing detail pages with gallery and protected owner contact
- Login-required contact access, favorites, image upload, and listing submission
- Email verification and password reset flows
- Owner-only moderation dashboard for pending listings and user blocking
- User listing management with edit, delete, and active/rented/sold controls
- PostgreSQL-backed user sessions
- Supabase Storage-backed image uploads for public-safe storage when configured

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SITE_URL`: public base URL, for example `https://rentals.example.com`
- `PUBLIC_CONTACT_EMAIL`: footer/contact page email
- `OWNER_EMAIL`: the single owner account email
- `SUPABASE_URL`: Supabase project URL, used for storage uploads
- `SUPABASE_SECRET_KEY`: Supabase secret key for server-side storage uploads
- `SUPABASE_STORAGE_BUCKET`: public Storage bucket name, for example `listing-images`
- `CLOUDINARY_CLOUD_NAME`: optional Cloudinary cloud name
- `CLOUDINARY_API_KEY`: optional Cloudinary API key
- `CLOUDINARY_API_SECRET`: optional Cloudinary API secret
- `CLOUDINARY_UPLOAD_FOLDER`: optional Cloudinary folder path
- `SMTP_HOST`: SMTP server hostname, for example `smtp.gmail.com`
- `SMTP_PORT`: SMTP server port, for example `465`
- `SMTP_SECURE`: `true` for implicit TLS, usually `true` on port `465`
- `SMTP_USER`: SMTP login username
- `SMTP_PASS`: SMTP password or app password
- `RESEND_API_KEY`: optional Resend API key for password reset emails
- `EMAIL_FROM`: sender identity for outgoing emails

Important:

- Do not commit real secrets.
- `OWNER_EMAIL` is checked only on the server and is not exposed to the client.
- The recommended free image storage for this project is Supabase Storage.
- Create a public Supabase Storage bucket, for example `listing-images`, before using public-safe uploads.
- If no cloud image provider is configured, uploads fall back to local filesystem storage only for development.
- In production, the upload API now expects Supabase Storage or Cloudinary to be configured and will reject image uploads if both are missing.
- SMTP is used first for outgoing email when configured.
- If SMTP is not configured, Resend is used when configured.
- If no email provider is configured, password reset emails are logged to the server console.

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
- Owner dashboard: `http://localhost:3000/admin`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## Auth and moderation

- Browsing is public.
- Users must log in before:
  - viewing owner contact details
  - uploading listing images
  - submitting new listings
  - using favorites and account pages
- Users can request password reset links from `/forgot-password`.
- If the logged-in email matches `OWNER_EMAIL`, the same normal login flow redirects that account to the owner dashboard.
- Normal users are redirected to `/account` after a direct login or register with no special next path.
- New listings are stored as `PENDING`.
- Only `APPROVED` and `ACTIVE` listings appear on public pages.
- Blocked users cannot log in through the normal user flow.
- Pending listing moderation is available only in the owner dashboard.
- User block/unblock controls are available only to the owner account from `OWNER_EMAIL`.
- Users can edit or delete their own listings and mark approved listings as rented, sold, or active again.

## Public launch notes

- The site now includes:
  - footer pages for About, Contact, Privacy, and Terms
  - sitemap and robots routes
  - shareable metadata for listing detail pages
  - noindex protection on auth, account, admin, and submission pages
- Supabase Storage upload support for durable public image storage
- Cloudinary remains supported as an optional alternative
- password reset email plumbing
- Local image storage still writes files to `public/uploads/listings` as a development fallback.
- For real public hosting, configure Supabase Storage and an email provider before launch.

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
