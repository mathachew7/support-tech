---
name: build-phase
description: Resume or implement the current roadmap phase of the support-tech marketplace using its TDD, one-phase-at-a-time workflow. Use when the user says to start/continue/build a phase, or asks "where are we / what's next".
---

# build-phase

Drives one phase of `support-tech` from the tracker, test-first, without leaking into future phases.

## 1. Orient (cheap - read, do not scan the whole tree)
- Read `docs/PROGRESS.md` -> find **Current phase** and its unchecked items.
- Read the matching phase prompt in `docs/project-spec.md` section 7.
- Check `docs/DECISIONS.md` for `[OPEN]` items - resolve blockers with the user before coding.

## 2. Build each item TDD-style (Red -> Green -> Refactor)
For every unchecked item in the current phase:
1. **Red** - write the failing test that pins the behaviour (esp. business rules: no-show decrements hours, hours expire at period end, provider must be admin-approved to be bookable).
2. **Green** - minimal code to pass.
3. **Refactor** - clean up; keep domain logic in `/lib/services`, organized by feature domain.
4. Keep the suite green before moving on.

## 3. Scope discipline
- Only touch the current phase's feature domain. If something belongs to a later phase, note it in PROGRESS.md and stop - do not build it.

## 4. Close out
- Run the full test suite + lint/typecheck.
- Tick completed items in `docs/PROGRESS.md`; add a dated `Session log` line.
- Log any non-obvious choice in `docs/DECISIONS.md`.
- If the phase is fully done, set the next phase as **Current phase** and tell the user what got done and what is next.

## Definition of Done
Failing test -> passing code -> green suite -> clean lint/typecheck -> PROGRESS.md updated.
