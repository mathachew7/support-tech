"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { approveProvider, assignProviderToRequest } from "@/lib/services/admin";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function approveProviderAction(formData: FormData) {
  // Defence in depth: the route guard already gates /admin, but the action is
  // its own entry point, so re-check the caller is an admin.
  if (!(await requireAdmin())) throw new Error("Not authorized");

  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing user");

  await approveProvider(userId);
  revalidatePath("/admin/users");
}

export type AssignState = { error?: string };

export async function assignProviderAction(
  _prev: AssignState,
  formData: FormData,
): Promise<AssignState> {
  if (!(await requireAdmin())) return { error: "Not authorized" };

  const requestId = String(formData.get("requestId") ?? "");
  const providerId = String(formData.get("providerId") ?? "");
  const datetimeStr = String(formData.get("datetime") ?? "");
  const note = String(formData.get("note") ?? "");
  const datetime = new Date(datetimeStr);

  const result = await assignProviderToRequest({ requestId, providerId, datetime, note });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/requests");
  redirect("/admin/requests?assigned=1");
}
