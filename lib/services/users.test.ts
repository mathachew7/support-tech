import { describe, it, expect } from "vitest";
import { initialStatusFor, approveProviderTransition } from "./users";

// Phase 1 business rule: a provider must be admin-approved before becoming
// bookable, so providers start `pending`; seekers/admins are usable immediately.
describe("initialStatusFor", () => {
  it("starts providers as pending (admin must approve)", () => {
    expect(initialStatusFor("provider")).toBe("pending");
  });

  it("starts seekers as approved", () => {
    expect(initialStatusFor("seeker")).toBe("approved");
  });

  it("starts admins as approved", () => {
    expect(initialStatusFor("admin")).toBe("approved");
  });
});

// The admin approval action: pending provider -> approved. Everything else is
// rejected so the dashboard cannot approve the wrong thing.
describe("approveProviderTransition", () => {
  it("approves a pending provider", () => {
    const r = approveProviderTransition({ role: "provider", status: "pending" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.status).toBe("approved");
  });

  it("rejects a non-provider (nothing to approve)", () => {
    const r = approveProviderTransition({ role: "seeker", status: "pending" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/provider/i);
  });

  it("rejects an already-approved provider (no-op is an error)", () => {
    const r = approveProviderTransition({ role: "provider", status: "approved" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/already/i);
  });

  it("rejects a suspended provider (must be reinstated deliberately, not via approve)", () => {
    const r = approveProviderTransition({ role: "provider", status: "suspended" });
    expect(r.ok).toBe(false);
  });
});
