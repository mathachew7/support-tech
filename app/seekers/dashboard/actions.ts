"use server";

import { auth } from "@/lib/auth/auth";
import { saveSeekerProfile } from "@/lib/services/seekers";

export type ProfileState = { ok?: boolean; error?: string };

export async function saveSeekerProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== "seeker") {
    return { error: "Not authorized" };
  }

  await saveSeekerProfile(userId, {
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
  });

  return { ok: true };
}
