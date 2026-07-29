// Admin actions over users. The approval rule itself is pure + unit-tested in
// ./users; this is the thin DB wrapper that loads, applies it, and persists.
import { prisma } from "@/lib/db/prisma";
import { approveProviderTransition } from "@/lib/services/users";

/** All users, newest first, with the counts the admin list needs. */
export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { providerSkills: true, availability: true } },
    },
  });
}

export type ApproveOutcome = { ok: true } | { ok: false; error: string };

/** Approve a pending provider. Rejects anything the transition rule disallows. */
export async function approveProvider(userId: string): Promise<ApproveOutcome> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const transition = approveProviderTransition(user);
  if (!transition.ok) return transition;

  await prisma.user.update({
    where: { id: userId },
    data: { status: transition.status },
  });
  return { ok: true };
}
