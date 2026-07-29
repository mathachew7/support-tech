# Decision Log (ADR-lite) - support-tech

One entry per non-obvious decision, newest first.
Keep each entry short: what, why, and what it rules out.
Link from PROGRESS.md items with `(DECISIONS.md #N)`.

---

## #1 - Auth provider  `[OPEN]`
**Question:** Supabase Auth vs Clerk vs a self-hosted option (Auth.js/Lucia) for seeker/provider/admin roles.
**Status:** pending user decision (blocks Phase 0 scaffold).
**Trade-off:** Since we run fully in Docker with no hosting yet, Supabase/Clerk are hosted services (need cloud accounts even in dev); a self-hosted option keeps dev entirely local.
**Decision:** TBD.

---

## #0 - Local-first via Docker
**Decision:** Build and run entirely locally in Docker (app + Postgres) before choosing a host.
**Why:** User asked to defer hosting and start Docker from day one; keeps the dev loop reproducible and offline-capable.
**Rules out (for now):** relying on a hosted Postgres (Supabase/Neon) during development.
