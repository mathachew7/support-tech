# Progress Tracker - support-tech

**This file is the source of truth for what is done and what is next.**
Read it at the start of every session. Update it at the end of every unit of work.
Keep it terse - it exists to save re-scanning the whole codebase.

---

## Current phase
> **Phase 0 - Project Setup** (not started)

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

### Phase 0 - Project Setup  `[ ]`
- [ ] Scaffold Next.js (TypeScript, App Router)
- [ ] Wire Prisma + PostgreSQL (DATABASE_URL)
- [ ] Auth with roles: seeker / provider / admin  *(provider: DECISIONS.md #1)*
- [ ] Feature-domain folders: /app/{bookings,subscriptions,matching,payments,providers,seekers,admin}, /lib/{db,services,auth}
- [ ] Role-based route guard middleware
- [ ] Test runner + first passing smoke test (Vitest/Jest) - TDD harness
- [ ] `docker compose up` runs app + db locally
- Scope guard: scaffolding, auth, folders ONLY. No business logic.

### Phase 1 - Foundation (Profiles & Skills)  `[ ]`
- [ ] Models: User, Skill, ProviderSkill, Availability
- [ ] Seeker signup/profile
- [ ] Provider signup/profile (skills + proficiency, weekly availability)
- [ ] Admin dashboard: list users, approve provider (pending -> approved)

### Phase 2 - Booking & Scheduling  `[ ]`
- [ ] Model: Booking
- [ ] Seeker "request a session" with suggested providers (skill + availability overlap, server-side scoring)
- [ ] Admin assign/reassign + confirm
- [ ] Status lifecycle: scheduled -> completed/no_show/cancelled
- [ ] Resend email on confirmation

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
- 2026-07-29: Foundation/meta layer created. TDD + one-phase-at-a-time working agreement set. Next: Phase 0 scaffold (pending auth-provider decision).
