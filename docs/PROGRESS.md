# Progress Tracker - support-tech

**This file is the source of truth for what is done and what is next.**
Read it at the start of every session. Update it at the end of every unit of work.
Keep it terse - it exists to save re-scanning the whole codebase.

---

## Current phase
> **Phase 2 - Booking & Scheduling** (in progress)

## Legend
`[ ]` todo  `[~]` in progress  `[x]` done  `[!]` blocked/needs decision

---

## Foundation (meta layer) - DONE
- [x] Git repo initialised
- [x] docs/GOAL.md - north star
- [x] docs/project-spec.md - canonical full spec
- [x] docs/PROGRESS.md - this tracker
- [x] docs/DECISIONS.md - decision log (ADR-lite)
- [x] CLAUDE.md - project working agreement (TDD, one-phase-at-a-time)
- [x] Docker: docker-compose (postgres + adminer), Dockerfile placeholder, .dockerignore
- [x] .gitignore, .env.example
- [x] .claude/skills/build-phase - phase workflow skill
- [ ] Codegraph index (`codegraph init`) - defer until Phase 1 has real code (user runs it)

---

## Roadmap

### Phase 0 - Project Setup  `[x]` DONE
- [x] Scaffold Next.js 16 + React 19 (TypeScript, App Router)
- [x] Wire Prisma + PostgreSQL - migration `init_user` applied, `User` table live
- [x] Auth.js v5: Credentials + JWT, split edge-safe config (DECISIONS.md #1, #3)
- [x] Feature-domain folders under /app + /lib/{db,services,auth}
- [x] Role-based route guard in `proxy.ts` over the tested `lib/auth/access` core
- [x] Vitest TDD harness + first red->green test (6 tests, `lib/auth/access.test.ts`)
- [x] Postgres runs in Docker; `docker compose up` (app+db) configured
- Verified: `npm test` green, `npm run build` typechecks/compiles, DB migration applied.
- Not yet run this turn: the `app` service inside Docker (`docker compose up`) - app verified locally via `next build`; container build is configured and ready.

### Phase 1 - Foundation (Profiles & Skills)  `[x]` DONE
- [x] Models: User, Skill, ProviderSkill, Availability (migration `phase1_profiles_skills` applied; skill catalog seeded, 17 skills)
- [x] Seeker signup/profile (signup form + editable profile in seeker dashboard)
- [x] Provider signup/profile (skills + proficiency + weekly availability editor; pending-approval banner)
- [x] Admin dashboard: list users w/ role+status, approve provider (pending -> approved)
- Verified: `npm test` green (28), `npm run lint` clean, `npm run build` typechecks/compiles (17 routes), DB service layer smoke-tested end-to-end (register->pending, profile save, overlap rejected, approve->approved, double-approve rejected).
- Rules under test (pure, /lib/services): `initialStatusFor` (provider->pending), `approveProviderTransition`, weekly availability validation (range/order/overlap).

### Phase 2 - Booking & Scheduling  `[~]`
- [x] Model: Booking (migration `phase2_booking`; `requested` status, nullable provider, 60-min default - DECISIONS.md #8)
- [x] Seeker "request a session" with suggested providers (skill + availability overlap, server-side scoring)
- [ ] Admin assign/reassign + confirm
- [ ] Status lifecycle: scheduled -> completed/no_show/cancelled
- [ ] Resend email on confirmation
- Built vertical-slice (user preference): pure matcher `lib/services/matching.ts` (9 tests) -> Booking model -> seeker request page `/seekers/dashboard/request` + bookings list on dashboard. Verified end-to-end against seeded provider.

### Phase 3 - Payments & Subscriptions  `[ ]`
- [ ] Models: SubscriptionPlan, Subscription, Payment
- [ ] Admin-defined plans
- [ ] Stripe Checkout + webhook (subscribe / one-off)
- [ ] Hour tracking via /lib/services on completed/no_show
- [ ] Mirror Stripe data into Payment table

### Phase 4 - Custom Request Ticketing  `[ ]`
- [ ] Model: CustomRequest
- [ ] Seeker "ask for custom help" form
- [ ] Admin match (reuse booking flow) + status
- [ ] One-off Stripe payment for uncovered requests

### Phase 5 - Auto-Matching (later, optional)  `[ ]`
- [ ] Rule-based scoring: skill overlap (highest) + availability + rating
- [ ] Surface top 3 to admin; admin override remains

---

## Session log (newest first)
- 2026-07-29: **Phase 2 slice 1: seeker session requests.** JoslaLink rebrand + HubSpot-style landing/auth redesign shipped. Then Phase 2 started vertical-slice: pure provider matcher (skill + availability + approved, ranked by proficiency; 9 tests) -> `Booking` model/migration (`requested` status, nullable provider; DECISIONS #8) -> seeker "request a session" page with live suggestions + bookings list. 37 tests green, lint/typecheck clean. Seeded test accounts (admin/seeker/provider @joslalink.com, pw Josla@123). Next: admin assign/confirm slice -> status lifecycle -> Resend email.
- 2026-07-29: **Phase 1 complete.** Profiles & skills built TDD. Pure rules in /lib/services (users, availability) + thin DB wrappers (providers, admin, seekers, signup). UI: signup/login/dashboard-router/forbidden, seeker + provider profile editors, admin user-list w/ approve. Skill catalog seeded via `tsx prisma/seed.ts`. Session now carries user id. Small design system in globals.css. Decisions #4-#7 logged. Next: Phase 2 - Booking model + session requests + admin assign + status lifecycle + Resend confirmation.
- 2026-07-29: **Phase 0 complete.** Next.js 16 + Prisma + Auth.js scaffolded; role guard tested (TDD, 6 green); DB migration applied in Docker; build clean. Decided auth=Auth.js (#1), design=Frontend Design/Anthropic (#2), credentials+JWT/proxy (#3). Next: Phase 1 - profiles & skills models + signup/profile pages + admin approval.
- 2026-07-29: Foundation/meta layer created. TDD + one-phase-at-a-time working agreement set.
