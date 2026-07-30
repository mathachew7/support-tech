// Admin actions over users. The approval rule itself is pure + unit-tested in
// ./users; this is the thin DB wrapper that loads, applies it, and persists.
import { prisma } from "@/lib/db/prisma";
import { approveProviderTransition } from "@/lib/services/users";

function sessionRef(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `SES-${code}`;
}

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

/** Counts for the admin overview / work queue. */
export async function getAdminStats() {
  const [pendingProviders, openRequests, scheduledSessions, pendingInvoices] =
    await Promise.all([
      prisma.user.count({ where: { role: "provider", status: "pending" } }),
      prisma.sessionRequest.count({ where: { status: "requested" } }),
      prisma.booking.count({ where: { status: "scheduled" } }),
      prisma.invoice.count({ where: { status: "pending" } }),
    ]);
  return { pendingProviders, openRequests, scheduledSessions, pendingInvoices };
}

/** Seeker requests awaiting a match (the admin queue), oldest first. */
export function getOpenRequests() {
  return prisma.sessionRequest.findMany({
    where: { status: "requested" },
    include: {
      seeker: { select: { name: true, email: true } },
      times: { orderBy: { datetime: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
}

/** A single request for the assign screen. */
export function getRequestForAssign(id: string) {
  return prisma.sessionRequest.findUnique({
    where: { id },
    include: {
      seeker: { select: { name: true, email: true } },
      times: { orderBy: { datetime: "asc" } },
    },
  });
}

/** Approved providers with their skills + availability, for the match picker. */
export function listApprovedProviders() {
  return prisma.user.findMany({
    where: { role: "provider", status: "approved" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      headline: true,
      providerSkills: { include: { skill: true } },
      availability: true,
    },
  });
}

export type AssignResult = { ok: true } | { ok: false; error: string };

/** Assign a provider to a request: create the scheduled booking, mark matched. */
export async function assignProviderToRequest(input: {
  requestId: string;
  providerId: string;
  datetime: Date;
  note?: string | null;
}): Promise<AssignResult> {
  if (!input.providerId) return { ok: false, error: "Choose a provider" };
  if (!(input.datetime instanceof Date) || Number.isNaN(input.datetime.getTime())) {
    return { ok: false, error: "Choose a valid session time" };
  }

  const req = await prisma.sessionRequest.findUnique({
    where: { id: input.requestId },
    select: { seekerId: true, skillId: true },
  });
  if (!req) return { ok: false, error: "Request not found" };

  await prisma.$transaction([
    prisma.booking.create({
      data: {
        reference: sessionRef(),
        seekerId: req.seekerId,
        providerId: input.providerId,
        requestId: input.requestId,
        skillId: req.skillId ?? null,
        datetime: input.datetime,
        durationMin: 60,
        note: input.note?.trim() || null,
        status: "scheduled",
      },
    }),
    prisma.sessionRequest.update({
      where: { id: input.requestId },
      data: { status: "matched" },
    }),
  ]);
  return { ok: true };
}

/** A user's full profile for the admin (sees everything). */
export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, status: true, createdAt: true,
      headline: true, bio: true, location: true, avatarUrl: true, company: true,
      position: true, linkedin: true, github: true, website: true, skills: true,
      phone: true, whatsapp: true,
      street: true, city: true, state: true, zip: true, country: true,
    },
  });
}

/** Seekers only (for the invoice recipient dropdown). */
export function listSeekers() {
  return prisma.user.findMany({
    where: { role: "seeker" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
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
