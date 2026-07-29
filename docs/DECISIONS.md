# Decision Log (ADR-lite) - support-tech

One entry per non-obvious decision, newest first.
Keep each entry short: what, why, and what it rules out.
Link from PROGRESS.md items with `(DECISIONS.md #N)`.

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
