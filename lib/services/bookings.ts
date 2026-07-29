// Booking persistence + provider suggestion. Thin DB wrapper around the pure,
// unit-tested matcher in ./matching. Loads approved providers who offer the
// requested skill, maps them to candidates, and ranks them for the slot.
import { prisma } from "@/lib/db/prisma";
import {
  suggestProviders,
  DEFAULT_SESSION_MIN,
  type ProviderCandidate,
  type Suggestion,
  type Proficiency,
} from "@/lib/services/matching";
import type { Day } from "@/lib/services/availability";

const DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Reduce an absolute datetime to the weekly slot the matcher works in.
// v1 uses server-local time (availability has no stored timezone yet).
function slotFromDate(d: Date): { day: Day; startMin: number } {
  return { day: DAYS[d.getDay()], startMin: d.getHours() * 60 + d.getMinutes() };
}

/** Ranked, admin-approved providers who can cover a session for `skillId` at `datetime`. */
export async function getSuggestedProviders(
  skillId: string,
  datetime: Date,
  durationMin: number = DEFAULT_SESSION_MIN,
): Promise<Suggestion[]> {
  const providers = await prisma.user.findMany({
    where: {
      role: "provider",
      status: "approved",
      providerSkills: { some: { skillId } },
    },
    include: { providerSkills: true, availability: true },
  });

  const candidates: ProviderCandidate[] = providers.map((p) => ({
    providerId: p.id,
    name: p.name,
    approved: p.status === "approved",
    skillIds: p.providerSkills.map((ps) => ps.skillId),
    proficiencyBySkill: Object.fromEntries(
      p.providerSkills.map((ps) => [ps.skillId, ps.proficiency as Proficiency]),
    ),
    availability: p.availability.map((a) => ({
      day: a.day,
      startMin: a.startMin,
      endMin: a.endMin,
    })),
  }));

  const { day, startMin } = slotFromDate(datetime);
  return suggestProviders({ skillId, day, startMin, durationMin }, candidates);
}

export type RequestSessionInput = {
  skillId: string;
  datetime: Date;
  durationMin?: number;
  note?: string | null;
};

export type RequestResult =
  | { ok: true; bookingId: string; suggestions: Suggestion[] }
  | { ok: false; error: string };

/**
 * Create a seeker's session request (status `requested`, no provider yet) and
 * return the ranked provider suggestions for it. Admin assignment is a later slice.
 */
export async function requestSession(
  seekerId: string,
  input: RequestSessionInput,
): Promise<RequestResult> {
  if (!input.skillId) return { ok: false, error: "Choose a skill" };
  if (!(input.datetime instanceof Date) || Number.isNaN(input.datetime.getTime())) {
    return { ok: false, error: "Choose a valid date and time" };
  }
  if (input.datetime.getTime() < Date.now()) {
    return { ok: false, error: "Pick a date and time in the future" };
  }

  const booking = await prisma.booking.create({
    data: {
      seekerId,
      skillId: input.skillId,
      datetime: input.datetime,
      durationMin: input.durationMin ?? DEFAULT_SESSION_MIN,
      note: input.note?.trim() || null,
      status: "requested",
    },
  });

  const suggestions = await getSuggestedProviders(
    input.skillId,
    input.datetime,
    booking.durationMin,
  );
  return { ok: true, bookingId: booking.id, suggestions };
}

/** A seeker's own bookings, soonest first, with skill + assigned provider. */
export function getSeekerBookings(seekerId: string) {
  return prisma.booking.findMany({
    where: { seekerId },
    include: {
      skill: true,
      provider: { select: { id: true, name: true } },
    },
    orderBy: { datetime: "asc" },
  });
}
