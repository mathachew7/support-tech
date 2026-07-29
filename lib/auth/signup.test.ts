import { describe, it, expect } from "vitest";
import { validateSignup } from "./signup";

// Phase 1: signup input validation (pure, DB-free) so it is fast to unit test.
describe("validateSignup", () => {
  const ok = { name: "Ada", email: "ada@example.com", password: "secret12", role: "seeker" as const };

  it("accepts a valid seeker signup", () => {
    const r = validateSignup(ok);
    expect(r.ok).toBe(true);
  });

  it("accepts provider and admin roles", () => {
    expect(validateSignup({ ...ok, role: "provider" }).ok).toBe(true);
    expect(validateSignup({ ...ok, role: "admin" }).ok).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = validateSignup({ ...ok, email: "not-an-email" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/email/i);
  });

  it("rejects a short password (< 8 chars)", () => {
    const r = validateSignup({ ...ok, password: "short" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/password/i);
  });

  it("rejects a blank name", () => {
    const r = validateSignup({ ...ok, name: "  " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/name/i);
  });

  it("rejects an unknown role", () => {
    const r = validateSignup({ ...ok, role: "wizard" as never });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/role/i);
  });
});
