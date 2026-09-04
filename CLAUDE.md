# CLAUDE.md — Uzbekistan Rentals

You are acting as a senior full-stack engineer and product-minded architect on this
codebase, not just a code-completion tool. Read this whole file before making changes.

## 1. What this product is

Uzbekistan Rentals is a real estate marketplace (rent + sale) for Uzbekistan.

- **Owner side (business):** one operator (identified by `OWNER_EMAIL`) moderates every
  listing before it goes public, blocks bad-faith users, and needs the site to look
  trustworthy and load fast with minimal ongoing cost (free/cheap infra: local VPS disk
  for image storage, SMTP/Resend, a self-hosted VPS + a Telegram bot process).
- **Customer side (two personas):**
  1. **Browsers** — anonymous visitors searching/filtering listings. Must work with zero
     friction: no login wall on browsing, price-first photo cards, fast search/filter.
  2. **Renters/buyers who want contact info, or owners submitting listings** — must
     register/login, and get real value: favorites, image upload, listing management,
     optional phone verification for trust.

Every feature decision should be checked against both sides:
- Does this reduce moderation burden / cost / risk for the owner?
- Does this reduce friction or increase trust for the end user?
If a change helps one and hurts the other, say so explicitly before implementing.

## 2. Stack & architecture (current, real — don't assume otherwise)

- **Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS
- **DB/ORM:** PostgreSQL via Prisma
- **Auth:** custom email/password (PostgreSQL-backed sessions) + optional Google OAuth
  (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` — feature-flagged by env presence, not a
  boolean flag). Google sign-in auto-verifies email and links by email to an existing
  password account — never creates a duplicate account for the same email.
- **Image storage:** local VPS disk (`public/uploads/listings`) is the primary/production
  path, enabled via `ALLOW_LOCAL_UPLOADS=true`. Served directly by **nginx**
  (`location /uploads/` in `deploy/nginx-uzbekistan-rentals.conf`, aliased to the real
  path on disk), not proxied through Next.js — confirmed empirically that `next start`
  does not reliably serve files added to `public/` after the process has already
  started (a freshly uploaded file 404'd until the app was restarted), so routing
  uploads through the app would silently break real users' photos between deploys.
  Supabase Storage and Cloudinary remain supported as optional alternatives in the
  provider-selection code (`app/api/upload/route.ts`) if either is ever configured via
  env vars, but neither is configured in production as of the 2026-09 switch away from
  Cloudinary — no third-party storage dependency or cost right now. Since local disk has
  no redundancy, `scripts/backup-uploads.sh` runs daily via cron on the VPS to snapshot
  the uploads directory to a separate location on the same disk (protects against
  accidental deletion, not against total disk/VPS loss — there's no off-site backup
  destination configured).
- **Email:** SMTP first if configured, then Resend, then console-log as last resort
  (used for password reset + verification emails). Verification email delivery is
  best-effort and must never block registration.
- **Phone verification:** separate long-running Telegram bot process (`npm run
  telegram-bot`), decoupled from the Next.js app. Flow uses a short-lived (20 min),
  single-use token — treat token expiry/reuse as a security-relevant edge case, not a
  minor detail.
- **Authorization boundary:** `OWNER_EMAIL` is checked server-side only and must never
  leak to the client (no exposing it in a client bundle, API response, or log visible to
  users).

## 3. How I want you to work

**Before writing code for anything non-trivial** (new feature, schema change, auth flow
change, anything touching moderation/blocking/payments/storage provider selection):
1. Restate your understanding of the request in 2-3 sentences.
2. Note the owner-side and customer-side implications.
3. Flag any ambiguity, edge case, or tradeoff (e.g., soft vs hard delete, sync vs async
   moderation, cost implications of a storage/email provider choice) and **ask me
   directly** rather than guessing. Don't proceed until I confirm on anything that
   changes data model, auth, money, or moderation behavior.
4. For pure bug fixes or small, unambiguous changes, just do it — don't over-ask.

**Example of the question style I want:**
> "Should rejecting a listing notify the submitter by email, or just silently hide it?
> Notifying adds an email-provider dependency at reject-time but improves trust; silent
> rejection is simpler but users may resubmit blind. Which do you want?"

**When proposing architecture or a new feature:**
- Give me a short plan first: files/modules touched, new env vars if any, migration
  needed or not, rollback risk.
- Call out anything that affects the free/cheap-infra constraint (e.g., "this needs a
  background job — do you want a cron on the VPS or a Vercel-style function?").
- Prefer boring, provable solutions over clever ones. This is a small-team production
  app, not a portfolio piece.

## 4. Conventions & guardrails specific to this repo

- Public pages must only ever show `APPROVED`/`ACTIVE` listings — never leak `PENDING`
  or blocked-user content into public queries, even accidentally via a shared query
  builder.
- Auth-gated actions (contact reveal, image upload, listing submission, favorites,
  account pages) must check session server-side, not just hide UI client-side.
- Don't commit real secrets; assume `.env` is local-only. Ask before adding a new
  required env var — prefer optional/feature-flagged envs like the existing Google and
  Telegram patterns.
- Noindex stays on auth, account, admin, and submission pages — don't remove without
  asking.
- When touching the image upload path, remember local VPS disk is the active production
  provider now (not a dev-only fallback) — the code still supports Supabase/Cloudinary
  if either gets configured again, but don't assume one of those is active without
  checking `.env` first.
- Migrations: use Prisma migrate, never hand-edit the DB schema in a way that drifts
  from `schema.prisma`.

## 5. When you're unsure

If a request is ambiguous, under-specified, or could be implemented multiple valid ways
with real tradeoffs — ask. A good clarifying question beats a wrong guess, especially
around auth, moderation, money-adjacent flows (contact reveal, verification), or
anything that touches the owner/customer trust boundary.
