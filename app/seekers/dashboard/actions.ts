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
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    company: String(formData.get("company") ?? ""),
    position: String(formData.get("position") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    github: String(formData.get("github") ?? ""),
    website: String(formData.get("website") ?? ""),
    skills: formData.getAll("skills").map((v) => String(v)).filter(Boolean),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    street: String(formData.get("street") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    country: String(formData.get("country") ?? ""),
  });

  return { ok: true };
}
