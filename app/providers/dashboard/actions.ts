"use server";

import { auth } from "@/lib/auth/auth";
import { saveProviderProfile } from "@/lib/services/providers";
import { DAYS } from "@/lib/services/availability";
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

export async function saveProviderProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== "provider") {
    return { error: "Not authorized" };
  }

  // Skills: a skill is offered when its checkbox is present; pair it with the
  // selected proficiency (default intermediate).
  const skillIds = formData.getAll("skill").map(String);
  const skills = skillIds.map((skillId) => {
    const prof = String(formData.get(`prof_${skillId}`) ?? "intermediate") as Proficiency;
    return {
      skillId,
      proficiency: PROFICIENCIES.includes(prof) ? prof : ("intermediate" as Proficiency),
    };
  });

  // Availability: one window per enabled day. Bad time strings are surfaced as
  // an error rather than silently dropped.
  const availability: { day: DayOfWeek; startMin: number; endMin: number }[] = [];
  for (const day of DAYS) {
    if (!formData.get(`avail_${day}`)) continue;
    const startMin = hhmmToMin(String(formData.get(`start_${day}`) ?? ""));
    const endMin = hhmmToMin(String(formData.get(`end_${day}`) ?? ""));
    if (startMin === null || endMin === null) {
      return { error: `Enter both a start and end time for ${day}.` };
    }
    availability.push({ day: day as DayOfWeek, startMin, endMin });
  }

  const result = await saveProviderProfile(userId, {
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
    skills,
    availability,
  });

  if (!result.ok) return { error: result.error };
  return { ok: true };
}
