"use server";

import { auth } from "@/lib/auth/auth";
import { requestSession } from "@/lib/services/bookings";
import type { Suggestion } from "@/lib/services/matching";

export type RequestState = {
  ok?: boolean;
  error?: string;
  suggestions?: Suggestion[];
};

export async function requestSessionAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== "seeker") {
    return { error: "Not authorized" };
  }

  const skillId = String(formData.get("skillId") ?? "");
  const datetimeStr = String(formData.get("datetime") ?? "");
  const note = String(formData.get("note") ?? "");
  const datetime = new Date(datetimeStr);

  const result = await requestSession(userId, { skillId, datetime, note });
  if (!result.ok) return { error: result.error };

  return { ok: true, suggestions: result.suggestions };
}
