"use server";

import { redirect } from "next/navigation";
import { registerUser } from "@/lib/auth/signup";
import type { Role } from "@/lib/auth/access";

export type SignupState = { error?: string };

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const result = await registerUser({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "") as Role,
  });

  if (!result.ok) return { error: result.error };

  // Account created; per the agreed flow, users sign in themselves next.
  redirect("/login?registered=1");
}
