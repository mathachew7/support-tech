# Decision Log (ADR-lite) - support-tech

One entry per non-obvious decision, newest first.
Keep each entry short: what, why, and what it rules out.
Link from PROGRESS.md items with `(DECISIONS.md #N)`.

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
