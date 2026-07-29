// Provider profile persistence: skills (+ proficiency) and weekly availability.
// Validation rules live in the pure, unit-tested helpers; this file is the thin
// DB wrapper that orchestrates them.
import { prisma } from "@/lib/db/prisma";
import { validateWeeklyAvailability, type Window } from "@/lib/services/availability";
import type { Proficiency, DayOfWeek } from "@prisma/client";

export type ProfileInput = {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  skills: { skillId: string; proficiency: Proficiency }[];
  availability: { day: DayOfWeek; startMin: number; endMin: number }[];
};

export type SaveResult = { ok: true } | { ok: false; error: string };

/** The full, admin-curated skill catalog, grouped-friendly (sorted). */
export function getSkillCatalog() {
  return prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}

/** A provider's current profile: user fields + attached skills + availability. */
export function getProviderProfile(providerId: string) {
  return prisma.user.findUnique({
    where: { id: providerId },
    include: {
      providerSkills: { include: { skill: true } },
      availability: { orderBy: [{ day: "asc" }, { startMin: "asc" }] },
    },
  });
}

/**
 * Replace a provider's skills + availability wholesale (the profile editor
 * submits the complete desired state). Availability is validated first so an
 * invalid grid never reaches the DB. Runs in one transaction.
 */
export async function saveProviderProfile(
  providerId: string,
  input: ProfileInput,
): Promise<SaveResult> {
  const windows: Window[] = input.availability.map((w) => ({
    day: w.day,
    startMin: w.startMin,
    endMin: w.endMin,
  }));
  const valid = validateWeeklyAvailability(windows);
  if (!valid.ok) return valid;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: providerId },
      data: {
        headline: input.headline?.trim() || null,
        bio: input.bio?.trim() || null,
        location: input.location?.trim() || null,
      },
    }),
    prisma.providerSkill.deleteMany({ where: { providerId } }),
    prisma.availability.deleteMany({ where: { providerId } }),
    prisma.providerSkill.createMany({
      data: input.skills.map((s) => ({
        providerId,
        skillId: s.skillId,
        proficiency: s.proficiency,
      })),
    }),
    prisma.availability.createMany({
      data: input.availability.map((w) => ({
        providerId,
        day: w.day,
        startMin: w.startMin,
        endMin: w.endMin,
      })),
    }),
  ]);

  return { ok: true };
}
