# Main Goal - support-tech

The north star. Read this first, then `PROGRESS.md` for current state.

## What we are building
A two-sided marketplace that connects **seekers** (working professionals who need help learning a tech skill for their job) with **providers** (people who teach/support that skill).
It replaces a currently-manual WhatsApp-based process for matching people and collecting payment.

## Who it serves
- **Seeker** - pays a flat platform/subscription fee, requests sessions or custom help, gets matched to a provider.
- **Provider** - self-lists skills and availability, is admin-approved, then becomes bookable.
- **Admin** - approves providers, reviews suggested matches, assigns bookings, arbitrates refunds/disputes manually.

## Business model
- Flat platform/subscription fee charged to **seekers only**.
- Providers are paid **outside the platform** in v1 - no split-payment or payout logic.
- Stripe standard only (subscriptions + one-off invoices). No Stripe Connect.

## Scale reality
- ~20-100 users today. Growth axis is **feature complexity, not raw traffic**.
- Optimise for clarity and correctness over throughput.

## v1 defaults (business rules)
- No-show counts against subscription hours.
- Unused hours expire at end of period - no rollover in v1.
- Providers are self-listed but admin-approved before becoming bookable.
- Refunds/disputes are admin-arbitrated manually.
- Matching is **admin-assisted**: system suggests, admin approves. Auto-matching is a later phase.

## Explicit non-goals (v1)
- No provider payouts / Stripe Connect.
- No automated matching (Phase 5, optional).
- No native mobile app.
- No real-time chat (WhatsApp/email is fine for now).
- Not optimising for high traffic or horizontal scale.
