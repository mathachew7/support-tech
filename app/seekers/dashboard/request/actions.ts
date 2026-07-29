"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { createSessionRequest } from "@/lib/services/requests";

export type RequestState = { error?: string };

export async function createRequestAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== "seeker") {
    return { error: "Not authorized" };
  }

  const skillsRaw = formData.getAll("skills").map((v) => String(v)).filter(Boolean);
  const commitmentMonths = Number(formData.get("commitmentMonths") ?? 0);
  const startDateStr = String(formData.get("startDate") ?? "");
  const startDate = new Date(startDateStr + "T00:00:00");
  const timezone = String(formData.get("timezone") ?? "");
  const note = String(formData.get("note") ?? "");
  // Preferred times are times-of-day ("HH:MM"); anchor them to the start date
  // for now (schema for recurring day/time refined in the next step).
  const times = formData
    .getAll("times")
    .map((v) => String(v))
    .filter(Boolean)
    .map((hhmm) => new Date(`${startDateStr}T${hhmm}:00`));

  const result = await createSessionRequest(userId, {
    skillsRaw,
    commitmentMonths,
    startDate,
    timezone,
    note,
    times,
  });
  if (!result.ok) return { error: result.error };

  // Success -> show it in the seeker's sessions list.
  redirect("/seekers/dashboard/sessions?requested=1");
}
