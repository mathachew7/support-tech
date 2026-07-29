// Pure authorization core used by the route-guard middleware.
// Kept framework-free so it is fast and trivial to unit test (TDD).

export type Role = "seeker" | "provider" | "admin";

// Route prefixes that require a specific role. First match wins, so list
// more specific prefixes before broader ones.
const GUARDED_ROUTES: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/providers/dashboard", role: "provider" },
  { prefix: "/seekers/dashboard", role: "seeker" },
];

/** The role a path requires, or null if the path is public. */
export function requiredRole(pathname: string): Role | null {
  const match = GUARDED_ROUTES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"),
  );
  return match ? match.role : null;
}

/**
 * Whether a user with `userRole` (null = anonymous) may access `pathname`.
 * Public routes are open to everyone; admin is a superuser over guarded routes.
 */
export function canAccess(userRole: Role | null, pathname: string): boolean {
  const needed = requiredRole(pathname);
  if (needed === null) return true; // public route
  if (userRole === null) return false; // anonymous, guarded route
  if (userRole === "admin") return true; // admin superuser
  return userRole === needed;
}
