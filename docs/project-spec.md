# Tech Support / Mentorship Marketplace - Build Spec

Canonical reference. `GOAL.md` is the summary; this is the detail.

## 1. Product Summary
A two-sided platform connecting **seekers** (working professionals needing tech skill help/mentorship for their job) with **providers** (people who teach/support those skills).
Replaces a currently-manual WhatsApp-based matching + payment process.

- **Business model:** Flat platform/subscription fee charged to seekers. Providers are paid separately (outside the platform, at least for v1) - no split-payment/payout logic needed.
- **Matching (v1):** Admin-assisted - system surfaces suggested matches (skill + availability overlap), admin approves/assigns. Full auto-matching is a later phase.
- **Scale:** ~20-100 users currently; growth axis is feature/complexity, not raw traffic.

## 2. Tech Stack
- **Framework:** Next.js (single app - frontend + API routes, one repo, one deploy)
- **Database:** PostgreSQL (local via Docker to start; Supabase/Neon free tier when hosting)
- **ORM:** Prisma
- **Auth:** Supabase Auth or Clerk (roles: seeker / provider / admin)
- **Payments:** Stripe (standard - subscriptions + one-off invoices; no Stripe Connect)
- **Email:** Resend (booking confirmations, invoices, match notifications)
- **Hosting:** deferred - build fully locally first (Docker), decide host later
- **Background jobs (later phase):** Inngest or a simple cron for subscription renewals/expiry, reminders

## 3. Folder Structure (Modular Monolith - organize by feature domain, not technical layer)
```
/app
  /bookings        -> booking logic, API routes, UI
  /subscriptions   -> plan logic, hour tracking, UI
  /matching        -> matching engine, admin approval UI
  /payments        -> Stripe integration, invoices
  /providers       -> provider profiles, skills, availability
  /seekers         -> seeker profiles, requests
  /admin           -> admin dashboard
/lib
  /db              -> Prisma client, shared queries
  /services        -> cross-domain logic (e.g. booking completion -> decrement subscription hours)
  /auth            -> auth helpers, role guards
prisma/
  schema.prisma
```

## 4. Data Model (Prisma-style outline)
```
User          { id, role[seeker|provider|admin], name, email, status, createdAt }
Skill         { id, name, category }
ProviderSkill { id, providerId, skillId, proficiency }
Availability  { id, providerId, dayOfWeek, startTime, endTime, timezone }
SubscriptionPlan { id, name, hoursPerPeriod, periodLengthDays, totalDurationMonths, price }
Subscription  { id, seekerId, planId, hoursUsed, hoursRemaining, status, startDate, endDate }
Booking       { id, seekerId, providerId, subscriptionId?, customRequestId?, datetime, status[scheduled|completed|no_show|cancelled] }
CustomRequest { id, seekerId, skillNeeded, description, status[open|matched|closed] }
Match         { id, requestId?, subscriptionId?, suggestedProviderId, adminApproved(bool) }
Payment       { id, userId, amount, stripeRef, status, relatedEntity }
```

## 5. Business Rules (defaults - adjust anytime)
- No-show counts against subscription hours.
- Unused hours expire at end of subscription period (no rollover in v1).
- Providers are self-listed but admin-approved before becoming bookable.
- Refunds/disputes are admin-arbitrated manually in v1.

## 6. Phased Roadmap
1. **Foundation** - auth, seeker/provider profiles, skill tagging, admin dashboard skeleton
2. **Booking & scheduling** - provider availability, session requests, admin-approved assignment
3. **Payments** - Stripe subscriptions, one-off invoicing for custom requests, hour tracking
4. **Custom request ticketing** - intake form -> admin matches -> reuses booking flow
5. **(Later)** Rule-based auto-matching - skill + availability + rating scoring, admin can still override

## 7. Per-phase build prompts
Kept verbatim from the original brief; feed one phase at a time, review/test before the next.

### Phase 0 - Project Setup
Initialize Next.js (TypeScript, App Router) for a two-sided service marketplace: Prisma + PostgreSQL (DATABASE_URL), auth with roles seeker/provider/admin, the feature-domain folder structure, and role-based route-guard middleware. Scaffolding, auth, and folders only - no business logic.

### Phase 1 - Foundation (Profiles & Skills)
Models User/Skill/ProviderSkill/Availability; seeker signup/profile; provider signup/profile (skills + proficiency, weekly availability); admin dashboard listing users with role/status and a provider-approval action (pending -> approved).

### Phase 2 - Booking & Scheduling
Model Booking; seeker "request a session" with server-side-suggested available providers (skill + availability overlap, simple scoring); admin assign/reassign + confirm; status lifecycle scheduled -> completed/no_show/cancelled; Resend email on confirmation.

### Phase 3 - Payments & Subscriptions
Models SubscriptionPlan/Subscription/Payment; admin-defined plans; Stripe Checkout + webhook (subscribe or one-off); hour tracking via /lib/services when a linked booking is completed/no_show; mirror Stripe data into Payment.

### Phase 4 - Custom Request Ticketing
Model CustomRequest; seeker "ask for custom help" form; admin view + match (reuse booking flow) + status; one-off Stripe payment for uncovered requests.

### Phase 5 - Auto-Matching (later, optional)
Rule-based scoring (skill overlap weighted highest + availability + rating), surface top 3 to admin, admin override remains.
