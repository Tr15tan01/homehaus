# HomeHaus

Aesthetics-first home decor and smart home store. Built as a portfolio
piece — custom auth (no third-party auth provider), Stripe checkout, an
admin dashboard, and an AI shopping/room-styling assistant with real
tool-calling against the product catalog.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **PostgreSQL + Prisma** — bring your own DB (Neon, Supabase, or local Postgres)
- **Custom auth** — bcrypt password hashing, hashed session tokens in
  httpOnly cookies, brute-force lockout, password reset. No Clerk/Auth.js.
- **Stripe Checkout** — server-side price recomputation, webhook-driven
  fulfillment, transactional stock decrement
- **Vercel AI SDK + Claude** — streaming chat with tool-calling
  (`searchProducts`, `buildRoomSet`, `checkStock`, `addToCart`, etc.)
- **Tailwind CSS v4** — custom design system, no default theme

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up a database.** Create a free Postgres instance on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com), or run
   Postgres locally. Copy `.env.example` to `.env` and fill in
   `DATABASE_URL`.

   ```bash
   cp .env.example .env
   ```

3. **Generate the Prisma client and run migrations**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed the catalog and an admin account**

   ```bash
   npm run db:seed
   ```

   This creates ~12 products across 7 categories, plus an admin user
   (`admin@homehaus.example` / `ChangeMe123!` by default — override with
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env` before seeding, and
   change the password after first login regardless).

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`. Sign in with the seeded admin account and
   visit `/admin` for the dashboard.

## Optional: Stripe checkout

Without Stripe keys configured, `/checkout` will show a clear "payments
aren't configured yet" message rather than crashing. To enable real
checkout:

1. Create a [Stripe](https://stripe.com) account, grab your test keys, and
   add them to `.env`.
2. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   and run:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.
3. In production, add a webhook endpoint in the Stripe dashboard pointing
   at `https://yourdomain.com/api/webhooks/stripe`, subscribed to
   `checkout.session.completed`.

## Optional: AI assistant

Without `ANTHROPIC_API_KEY` set, the assistant widget will respond with a
clear "not configured yet" message. Add a key from the
[Anthropic Console](https://console.anthropic.com/settings/keys) to enable
it. The assistant only reads from the catalog and stages cart items — it
never places an order on its own.

## What's intentionally left as a TODO

- **Transactional email.** Password reset currently returns the reset link
  directly in dev mode instead of emailing it (see the comment in
  `app/(auth)/actions.ts`). Wire in Resend, Postmark, or SES before going
  live — this needs your own sender domain, which isn't something to fake.
- **Rate limiting** (`lib/rate-limit.ts`) is in-memory, which is fine for a
  single instance but won't share state across multiple serverless
  instances. Swap for Upstash Redis + `@upstash/ratelimit` before scaling
  past one instance — the call sites are isolated to that one file.
- **Product image uploads.** The admin product form takes image URLs
  directly. For real production use, wire up direct upload to object
  storage (Vercel Blob, Supabase Storage, or S3/R2) instead.
- **Variant management UI.** Variants exist in the data model and are
  seeded with real data, but there's no admin UI to add/edit them yet —
  only products. Worth adding if you plan to manage inventory manually.

## Project structure

```
app/
  (auth)/          # login, register, forgot/reset password
  (shop)/actions.ts  # cart, favorites, reviews server actions
  products/        # catalog + product detail (SEO metadata, JSON-LD)
  cart/, checkout/ # cart and Stripe checkout flow
  account/         # orders, favorites
  admin/           # dashboard, product CRUD, order management (role-gated)
  api/
    chat/          # AI assistant streaming endpoint
    checkout/      # creates Stripe session
    webhooks/stripe/
lib/
  auth.ts          # the whole custom auth system
  assistant-tools.ts  # AI SDK tool definitions
  products.ts, cart.ts, prisma.ts, stripe.ts, validation.ts, rate-limit.ts
prisma/
  schema.prisma
  seed.ts
```
