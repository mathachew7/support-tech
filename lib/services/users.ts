// User lifecycle business rules. Pure + framework-free so they are fast to unit
// test; the DB wrappers (signup, admin approval) call into these.
import type { Role } from "@/lib/auth/access";

export type UserStatus = "pending" | "approved" | "suspended";

/**
 * The status a newly registered user starts in.
 * Providers must be admin-approved before becoming bookable, so they start
 * `pending`; seekers and admins are usable immediately.
 */
export function initialStatusFor(role: Role): UserStatus {
  return role === "provider" ? "pending" : "approved";
}

export type ApproveResult =
  | { ok: true; status: "approved" }
  | { ok: false; error: string };

/**
 * The admin "approve provider" action. Only a *pending provider* can be
 * approved this way; everything else is rejected so the dashboard cannot
 * approve the wrong user or silently no-op.
 */
export function approveProviderTransition(user: {
  role: Role;
  status: UserStatus;
}): ApproveResult {
  if (user.role !== "provider") {
    return { ok: false, error: "Only providers require approval" };
  }
  if (user.status === "approved") {
    return { ok: false, error: "Provider is already approved" };
  }
  if (user.status !== "pending") {
    return { ok: false, error: "Only pending providers can be approved" };
  }
  return { ok: true, status: "approved" };
}
