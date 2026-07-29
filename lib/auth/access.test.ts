import { describe, it, expect } from "vitest";
import { requiredRole, canAccess } from "./access";

// Phase 0: the pure authorization core that the route-guard middleware relies on.
// Business rule: routes are gated by role; admin is a superuser over guarded routes.
describe("route authorization", () => {
  it("maps /admin routes to the admin role", () => {
    expect(requiredRole("/admin")).toBe("admin");
    expect(requiredRole("/admin/users")).toBe("admin");
  });

  it("treats non-guarded routes as public (no role required)", () => {
    expect(requiredRole("/")).toBeNull();
    expect(requiredRole("/login")).toBeNull();
  });

  it("lets a user into routes matching their own role", () => {
    expect(canAccess("admin", "/admin/users")).toBe(true);
    expect(canAccess("provider", "/providers/dashboard")).toBe(true);
    expect(canAccess("seeker", "/seekers/dashboard")).toBe(true);
  });

  it("blocks a user from routes gated for another role", () => {
    expect(canAccess("seeker", "/admin")).toBe(false);
    expect(canAccess("provider", "/seekers/dashboard")).toBe(false);
  });

  it("treats admin as a superuser over any guarded route", () => {
    expect(canAccess("admin", "/providers/dashboard")).toBe(true);
    expect(canAccess("admin", "/seekers/dashboard")).toBe(true);
  });

  it("blocks anonymous users from guarded routes but allows public ones", () => {
    expect(canAccess(null, "/admin")).toBe(false);
    expect(canAccess(null, "/")).toBe(true);
  });
});
