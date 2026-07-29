// Seeker profile persistence: the base identity fields plus the richer profile
// (company, role, links, skills/interests) shown on the Account card.
import { prisma } from "@/lib/db/prisma";

export type SeekerProfileInput = {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  company?: string | null;
  position?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  skills?: string[];
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

export function getSeekerProfile(seekerId: string) {
  return prisma.user.findUnique({
    where: { id: seekerId },
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
      headline: true,
      bio: true,
      location: true,
      avatarUrl: true,
      company: true,
      position: true,
      linkedin: true,
      github: true,
      website: true,
      skills: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      country: true,
    },
  });
}

const clean = (s?: string | null) => (s ?? "").trim() || null;

/** Add https:// if a link was typed without a scheme; empty -> null. */
function normalizeUrl(u?: string | null): string | null {
  const s = (u ?? "").trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export async function saveSeekerProfile(seekerId: string, input: SeekerProfileInput) {
  await prisma.user.update({
    where: { id: seekerId },
    data: {
      headline: clean(input.headline),
      bio: clean(input.bio),
      location: clean(input.location),
      // Uploaded photo (data URL) or empty - stored as-is, not URL-normalized.
      avatarUrl: clean(input.avatarUrl),
      company: clean(input.company),
      position: clean(input.position),
      linkedin: normalizeUrl(input.linkedin),
      github: normalizeUrl(input.github),
      website: normalizeUrl(input.website),
      skills: (input.skills ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 30),
      street: clean(input.street),
      city: clean(input.city),
      state: clean(input.state),
      zip: clean(input.zip),
      country: clean(input.country),
    },
  });
}
