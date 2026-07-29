# support-tech - Project Working Agreement

Two-sided tech-mentorship marketplace.
`docs/GOAL.md` = north star. `docs/project-spec.md` = full spec. `docs/PROGRESS.md` = what is done / next (read every session). `docs/DECISIONS.md` = why we chose things.

## Start-of-session ritual (do this first, every time)
1. Read `docs/PROGRESS.md` - find the **Current phase** and its unchecked items.
2. Skim open items in `docs/DECISIONS.md` - anything marked `[OPEN]` may block you.
3. Work only the current phase. Do not scaffold future phases.

## End-of-work ritual (do this before stopping)
1. Tick off completed items in `docs/PROGRESS.md`, add a dated `Session log` line.
2. Record any non-obvious choice as a new `docs/DECISIONS.md` entry.
3. Keep both files terse - they exist to avoid re-scanning code.

## Development method - TDD (non-negotiable)
- **Red -> Green -> Refactor.** Write the failing test first, make it pass minimally, then clean up.
- No production code without a test that required it. No feature is "done" until its tests pass.
- Test the business rules explicitly (they are where bugs hide): no-show decrements hours, hours expire at period end, provider must be admin-approved to be bookable, etc.
- Prefer fast unit tests for `/lib/services` domain logic; integration tests for API routes; keep a thin E2E smoke path.
- Run the full test suite before committing.

## Definition of Done (per item)
Failing test written -> code makes it pass -> suite green -> lint/typecheck clean -> PROGRESS.md updated.

## Architecture
- **Modular monolith.** Organize by feature domain under `/app/<domain>` (bookings, subscriptions, matching, payments, providers, seekers, admin), NOT by technical layer.
- Cross-domain logic lives in `/lib/services` (e.g. booking completion -> decrement subscription hours). Domains talk through services, not by reaching into each other.
- `/lib/db` = Prisma client + shared queries. `/lib/auth` = auth helpers + role guards.

## Stack
Next.js (App Router, TS) - Prisma - PostgreSQL (local via Docker) - Stripe (standard, no Connect) - Resend - Auth: see DECISIONS.md #1.

## Conventions
- One phase at a time; review/test each phase before the next.
- Scope every change to the current phase's domain; flag scope creep instead of doing it.
- Business-rule defaults in `docs/GOAL.md` are the contract - change them there first if they change.

## House style (inherited from user global rules)
- No em dashes; use a plain hyphen.
- Long markdown files: one sentence per physical line.
- Commit messages: do NOT add an AI co-author line.
