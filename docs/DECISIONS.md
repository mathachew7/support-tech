# Decision Log (ADR-lite) - support-tech

One entry per non-obvious decision, newest first.
Keep each entry short: what, why, and what it rules out.
Link from PROGRESS.md items with `(DECISIONS.md #N)`.

---

## #11 - Invoices: admin-issued now, Stripe later (Phase 3 pulled forward)
**Decision:** Added an `Invoice` model (unique `number` "INV-00001", seeker FK, optional `requestId`, `amountCents` Int, `currency`, `status` pending/paid/void, issued/due/paid dates). Admin issues invoices and marks them paid; seekers view their own at `/seekers/dashboard/payments`. No real payment processing yet - "online payment coming soon"; admin confirms receipt. Pure rules in `invoices-core.ts` (money in cents, `dollarsToCents`, `formatInvoiceNumber`, `validateInvoiceDraft`, `canMarkPaid`; 10 tests). Numbering is sequential inside a transaction (count+1); single admin so contention is negligible.
**Why:** User asked for the payments/invoice listing now. Building the invoice ledger first (admin-issued, viewable, statuses) is the honest slice; Stripe checkout/webhooks bolt on later and update `status`/`paidAt`. Money stored as integer cents to avoid float rounding.
**Security:** seekers read only their own invoices (scoped by seekerId, IDOR-safe); only admins create/mark-paid (role-checked in the actions); invoices can only target seekers.
**Rules out (for now):** real card payment; subscriptions/plans; per-invoice line items.

---

## #10 - Cap: 3 active requests per seeker, enforced server-side
**Decision:** A seeker may hold at most `MAX_ACTIVE_REQUESTS = 3` *active* requests, where active = status `requested` or `matched`. Closed/cancelled requests free a slot. The rule is a pure helper (`isAtRequestLimit`, tested) enforced authoritatively in `createSessionRequest` inside a **Serializable** transaction (count + insert atomic) to stop a TOCTOU race from two concurrent submits. `seekerId` always comes from the session, never client input. UI (request page gate + `RequestButton`) is convenience only; a P2034 write-conflict returns a friendly retry error.
**Why:** Keeps the admin-assisted matching queue manageable and prevents spam/abuse. Server-side + atomic because UI limits are trivially bypassable and count-then-insert without isolation races.
**Rules out (for now):** per-plan limits; counting confirmed Bookings toward the cap (no seeker-created bookings yet - revisit when admin-confirm lands).

---

## #9 - Seeker requests use a `SessionRequest` (one request, many preferred times)
**Decision:** The seeker-facing "request a session" now creates a `SessionRequest` (id, skillName + optional catalog `skillId`, `commitmentMonths` 1/3/5, startDate, precomputed endDate, timezone, note, status) with child `SessionRequestTime` rows (the preferred times). A future subscription/payment model will link to this request by id.
Skill is a type-ahead over the catalog **plus free text**: a case-insensitive catalog hit keeps the canonical name+id ("aws" -> "AWS"); otherwise it is stored as title-cased free text with no id (pure rules + tests in `lib/services/requests-core.ts`).
The `Booking` model (DECISIONS #8) is retained for the *confirmed* session an admin creates from a request (assign slice) - it is no longer what the seeker creates directly.
**Why:** Matches the product: a seeker asks for help across a commitment window and offers several times; the admin matches. Keeping commitment as a stored field (no billing) respects one-phase-at-a-time - Stripe/subscriptions stay Phase 3 and will FK to the request.
**Rules out (for now):** multiple skills per request; billing on submit; auto-creating catalog skills from free text.

---

## #8 - Booking model: `requested` status, optional provider, 60-min slots, server-local time
**Decision:** `Booking` starts in a new `requested` status with `providerId` nullable; an admin later assigns a provider and confirms -> `scheduled` (then completed/no_show/cancelled).
Sessions default to `durationMin = 60`.
Matching reduces the booking's absolute `datetime` to a weekly (day-of-week + minute-of-day) slot using **server-local time** and checks it against provider `Availability` windows.
**Why:** The spec enum lacks a pre-assignment state, but GOAL.md's admin-assisted matching needs one - the seeker requests, the admin matches. Availability is stored as recurring weekly windows with no timezone, so local-time reduction is the simplest correct thing at ~20-100 users. `onDelete: SetNull` on the provider FK keeps a request intact for reassignment if a provider account is removed.
**Rules out (for now):** seeker picking their own provider; multi-timezone-correct scheduling; variable session lengths (single 60-min default). Revisit timezones when availability gains one.

---

## #7 - Signup flow: account first, profile after, self-sign-in
**Decision:** Signup creates the account only (name/email/password/role) and redirects to `/login`; providers complete skills + weekly availability afterward on an editable profile page in their dashboard. No auto sign-in.
**Why:** Keeps each page focused and the profile editable anytime (vs a long onboarding wizard). Redirect-to-login avoids wiring `signIn` into the signup action. Both chosen by the user.
**Rules out (for now):** all-in-one signup wizard; auto sign-in on registration.

---

## #6 - Admins are not self-registerable
**Decision:** The public signup role picker offers only seeker/provider. `registerUser` still accepts `admin` (used by scripts/seed), but no public UI path creates an admin.
**Why:** Self-serve admin creation is a privilege-escalation hole. Admins are provisioned out-of-band (script/seed).
**Note:** To create an admin locally: `npx tsx -e "..."` calling `registerUser({...role:'admin'})`, or seed one.

---

## #5 - Skill catalog seeded via tsx
**Decision:** `prisma/seed.ts` (idempotent upserts) run by `tsx`, wired as `package.json#prisma.seed` + `npm run db:seed`. Added `tsx` as a devDependency.
**Why:** Providers need skills to attach to in Phase 1; standard Prisma seed pattern. `tsx` runs TS seeds/scripts without a build step.
**Note:** Prisma warns `package.json#prisma` is deprecated for Prisma 7 (we are on 6) - migrate to `prisma.config.ts` when upgrading.

---

## #4 - Availability stored as minutes-from-midnight; business rules pure in /lib/services
**Decision:** Availability windows are `startMin`/`endMin` (0..1440). Validation (range, end>start, no same-day overlap) and the user-lifecycle rules (provider->pending on signup, pending-provider->approved on admin action) live as pure functions in `/lib/services` (`availability.ts`, `users.ts`), unit-tested; DB wrappers (`providers.ts`, `admin.ts`, `seekers.ts`, `signup.ts`) are thin orchestration.
**Why:** Mirrors the Phase 0 `access.ts` pattern - fast DB-free tests for the rules where bugs hide; integer minutes are trivial to compare/validate and timezone-free at rest. The profile editor uses one window/day; the model + validator already support multiple.
**Rules out (for now):** storing times as strings/DateTimes; putting business rules inside DB calls.

---

## #3 - Credentials + JWT sessions, no adapter tables (yet)
**Decision:** Auth.js uses the Credentials provider with `session.strategy = "jwt"`. The `User` table lives in our own Postgres; we did NOT add the Auth.js adapter tables (Account/Session/VerificationToken).
**Why:** Credentials auth is incompatible with database sessions and does not need the adapter. Keeps Phase 0 minimal. `@auth/prisma-adapter` is installed but unused - it is there for when we add OAuth later.
**Split config:** `lib/auth/auth.config.ts` is edge-safe (no Prisma/bcrypt) so `proxy.ts` can import it; `lib/auth/auth.ts` adds the DB-backed Credentials provider. This is the standard Auth.js v5 pattern to keep Prisma out of the edge middleware.
**Note:** Next 16 renamed the `middleware` convention to `proxy` - our guard lives in `proxy.ts`.

---

## #2 - Frontend design direction: Frontend Design (Anthropic)
**Decision:** Use the "Frontend Design (Anthropic)" direction for UI.
**Why:** First-party, calibrated for clean/functional/accessible role-based dashboards; matches "simple now, polish later" without looking unfinished, and holds to the pixel-perfect standard. "Impeccable" / "UI/UX Pro Max" lean visually maximalist - overkill for an admin/dashboard product.
**Applies from:** Phase 1 (first real UI). Not a loaded tool in this session - it is a direction. Revisit if those are installed as plugins.

---

## #1 - Auth provider: Auth.js (self-hosted)  `[DECIDED]`
**Decision:** Auth.js (NextAuth v5) with credentials, roles/status on our own `User` model.
**Why:** `User` is the hub of the data model (skills, availability, subscriptions, bookings, payments all FK to it) and the core logic is authorization. Keeping identity in our Postgres avoids a two-system sync (as Clerk/Supabase would require), runs 100% locally in Docker, and makes the authz rules directly testable under TDD. Cost: we build password/session wiring ourselves - small at this scale.
**Rules out (for now):** Clerk, Supabase Auth. Can layer an OAuth provider later without re-architecting.

---

## #0 - Local-first via Docker
**Decision:** Build and run entirely locally in Docker (app + Postgres) before choosing a host.
**Why:** User asked to defer hosting and start Docker from day one; keeps the dev loop reproducible and offline-capable.
**Rules out (for now):** relying on a hosted Postgres (Supabase/Neon) during development.
