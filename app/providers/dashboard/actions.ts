"use server";

import { auth } from "@/lib/auth/auth";
import {
  saveProviderPersonal,
  saveProviderSkills,
  saveProviderAvailability,
} from "@/lib/services/providers";
import type { Proficiency, DayOfWeek } from "@prisma/client";

export type ProfileState = { ok?: boolean; error?: string };

const PROFICIENCIES: Proficiency[] = ["beginner", "intermediate", "advanced", "expert"];

/** "HH:MM" -> minutes from midnight, or null if blank/malformed. */
function hhmmToMin(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const min = Number(m[1]) * 60 + Number(m[2]);
  return Number.isFinite(min) ? min : null;
}

async function requireProvider() {
  const session = await auth();
  const userId = session?.user?.id;
  return userId && session?.user?.role === "provider" ? userId : null;
}

/** Save the provider's personal profile fields. */
export async function saveProviderPersonalAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const userId = await requireProvider();
  if (!userId) return { error: "Not authorized" };

  await saveProviderPersonal(userId, {
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    company: String(formData.get("company") ?? ""),
    position: String(formData.get("position") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    github: String(formData.get("github") ?? ""),
    website: String(formData.get("website") ?? ""),
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

/** Save the provider's offered skills (+ proficiency). Names may be new. */
export async function saveProviderSkillsAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const userId = await requireProvider();
  if (!userId) return { error: "Not authorized" };

  // skillName[] and proficiency[] are rendered in row order, so they align by index.
  const names = formData.getAll("skillName").map(String);
  const profs = formData.getAll("proficiency").map(String);
  const skills = names.map((name, i) => {
    const prof = profs[i] as Proficiency;
    return {
      name,
      proficiency: PROFICIENCIES.includes(prof) ? prof : ("intermediate" as Proficiency),
    };
  });

  await saveProviderSkills(userId, skills);
  return { ok: true };
}

/** Save the provider's weekly availability. */
export async function saveProviderAvailabilityAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const userId = await requireProvider();
  if (!userId) return { error: "Not authorized" };

  // day[] / start[] / end[] are rendered per-slot in order, so they align by index.
  const days = formData.getAll("day").map(String);
  const starts = formData.getAll("start").map(String);
  const ends = formData.getAll("end").map(String);
  const availability: { day: DayOfWeek; startMin: number; endMin: number }[] = [];
  for (let i = 0; i < days.length; i++) {
    const startMin = hhmmToMin(starts[i] ?? "");
    const endMin = hhmmToMin(ends[i] ?? "");
    if (startMin === null || endMin === null) {
      return { error: "Enter a valid start and end time for each slot." };
    }
    availability.push({ day: days[i] as DayOfWeek, startMin, endMin });
  }

  const result = await saveProviderAvailability(userId, availability);
  if (!result.ok) return { error: result.error };
  return { ok: true };
}
