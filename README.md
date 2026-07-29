# support-tech

Two-sided marketplace connecting seekers (professionals learning a tech skill) with providers (mentors), with admin-assisted matching and Stripe-based seeker subscriptions.

## Where to look
- `docs/GOAL.md` - what we are building and why.
- `docs/PROGRESS.md` - current phase, what is done, what is next.
- `docs/project-spec.md` - full spec + per-phase build prompts.
- `docs/DECISIONS.md` - why we chose things.
- `CLAUDE.md` - working agreement (TDD, one phase at a time).

## Local dev
```bash
cp .env.example .env
docker compose up -d          # Postgres on :5432, Adminer DB UI on :8080
```
The Next.js app + its container are added in Phase 0.

## Method
TDD (red -> green -> refactor), one roadmap phase at a time. Nothing is done until its tests pass.
