// Seeker profile persistence. Seekers only have the base profile fields
// (headline / bio / location); providers additionally have skills + availability.
import { prisma } from "@/lib/db/prisma";

export type SeekerProfileInput = {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
};

export function getSeekerProfile(seekerId: string) {
  return prisma.user.findUnique({
    where: { id: seekerId },
    select: { name: true, email: true, headline: true, bio: true, location: true },
  });
}

export async function saveSeekerProfile(seekerId: string, input: SeekerProfileInput) {
  await prisma.user.update({
    where: { id: seekerId },
    data: {
      headline: input.headline?.trim() || null,
      bio: input.bio?.trim() || null,
      location: input.location?.trim() || null,
    },
  });
}
