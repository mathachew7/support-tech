"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { approveProvider } from "@/lib/services/admin";

export async function approveProviderAction(formData: FormData) {
  // Defence in depth: the route guard already gates /admin, but the action is
  // its own entry point, so re-check the caller is an admin.
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Not authorized");
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing user");

  await approveProvider(userId);
  revalidatePath("/admin");
}
