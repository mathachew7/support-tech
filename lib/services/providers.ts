// Provider profile persistence: skills (+ proficiency) and weekly availability.
// Validation rules live in the pure, unit-tested helpers; this file is the thin
// DB wrapper that orchestrates them.
import { prisma } from "@/lib/db/prisma";
import { validateWeeklyAvailability, type Window } from "@/lib/services/availability";
import { normalizeSkillName } from "@/lib/services/requests-core";
import type { Proficiency, DayOfWeek } from "@prisma/client";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export type ProviderPersonalInput = {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  company?: string | null;
  position?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

export type ProviderSkillEntry = { name: string; proficiency: Proficiency };
export type ProviderAvailabilityWindow = {
  day: DayOfWeek;
  startMin: number;
  endMin: number;
};

const clean = (s?: string | null) => (s ?? "").trim() || null;
function normalizeUrl(u?: string | null): string | null {
  const s = (u ?? "").trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export type SaveResult = { ok: true } | { ok: false; error: string };

/** The full, admin-curated skill catalog, grouped-friendly (sorted). */
export function getSkillCatalog() {
  return prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}

/** Sessions assigned to a provider (soonest first). Empty until admin assigns. */
export function getProviderBookings(providerId: string) {
  return prisma.booking.findMany({
    where: { providerId },
    include: {
      skill: true,
      seeker: { select: { id: true, name: true } },
      request: {
        select: {
          skillName: true,
          commitmentMonths: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { datetime: "asc" },
  });
}

/**
 * A seeker's contact card for a provider - ONLY if that seeker is assigned to
 * them (a booking exists between the two). Returns null otherwise (IDOR-safe),
 * so a provider can't pull up an arbitrary user's phone/WhatsApp.
 */
export async function getAssignedSeeker(providerId: string, seekerId: string) {
  const bookings = await prisma.booking.findMany({
    where: { providerId, seekerId },
    include: {
      skill: true,
      seeker: { select: { id: true, name: true } },
      request: {
        select: { skillName: true, commitmentMonths: true, startDate: true, endDate: true },
      },
    },
    orderBy: { datetime: "asc" },
  });
  if (bookings.length === 0) return null;

  const seeker = await prisma.user.findUnique({
    where: { id: seekerId },
    select: {
      name: true, email: true, createdAt: true, headline: true, bio: true,
      location: true, avatarUrl: true, company: true, position: true,
      linkedin: true, github: true, website: true, skills: true,
      phone: true, whatsapp: true,
      street: true, city: true, state: true, zip: true, country: true,
    },
  });

  return { seeker, bookings };
}

/** A single booking scoped to its provider (IDOR-safe: null when not theirs). */
export function getProviderBooking(providerId: string, id: string) {
  return prisma.booking.findFirst({
    where: { id, providerId },
    include: {
      skill: true,
      seeker: { select: { name: true, email: true } },
      request: {
        select: {
          skillName: true,
          commitmentMonths: true,
          startDate: true,
          endDate: true,
          timezone: true,
        },
      },
    },
  });
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

/** Save a provider's personal profile fields (no skills/availability). */
export async function saveProviderPersonal(
  providerId: string,
  input: ProviderPersonalInput,
): Promise<SaveResult> {
  await prisma.user.update({
    where: { id: providerId },
    data: {
      headline: clean(input.headline),
      bio: clean(input.bio),
      location: clean(input.location),
      avatarUrl: clean(input.avatarUrl),
      company: clean(input.company),
      position: clean(input.position),
      linkedin: normalizeUrl(input.linkedin),
      github: normalizeUrl(input.github),
      website: normalizeUrl(input.website),
      phone: clean(input.phone),
      whatsapp: clean(input.whatsapp),
      street: clean(input.street),
      city: clean(input.city),
      state: clean(input.state),
      zip: clean(input.zip),
      country: clean(input.country),
    },
  });
  return { ok: true };
}

/**
 * Replace a provider's offered skills wholesale. Skills are given by name;
 * any not already in the catalog are created (category "Other") so a provider
 * can offer anything and matching/search still work. De-duplicated.
 */
export async function saveProviderSkills(
  providerId: string,
  entries: ProviderSkillEntry[],
): Promise<SaveResult> {
  const resolved: { skillId: string; proficiency: Proficiency }[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const name = normalizeSkillName(e.name);
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;
    const skill = await prisma.skill.upsert({
      where: { slug },
      update: {},
      create: { name, slug, category: "Other" },
    });
    if (seen.has(skill.id)) continue;
    seen.add(skill.id);
    resolved.push({ skillId: skill.id, proficiency: e.proficiency });
  }

  await prisma.$transaction([
    prisma.providerSkill.deleteMany({ where: { providerId } }),
    prisma.providerSkill.createMany({
      data: resolved.map((r) => ({
        providerId,
        skillId: r.skillId,
        proficiency: r.proficiency,
      })),
    }),
  ]);
  return { ok: true };
}

/** Replace a provider's weekly availability wholesale. Validated first. */
export async function saveProviderAvailability(
  providerId: string,
  availability: ProviderAvailabilityWindow[],
): Promise<SaveResult> {
  const windows: Window[] = availability.map((w) => ({
    day: w.day,
    startMin: w.startMin,
    endMin: w.endMin,
  }));
  const valid = validateWeeklyAvailability(windows);
  if (!valid.ok) return valid;

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { providerId } }),
    prisma.availability.createMany({
      data: availability.map((w) => ({
        providerId,
        day: w.day,
        startMin: w.startMin,
        endMin: w.endMin,
      })),
    }),
  ]);
  return { ok: true };
}
