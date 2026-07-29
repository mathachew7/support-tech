import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/lib/auth/access";
import { initialStatusFor } from "@/lib/services/users";

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const ROLES: Role[] = ["seeker", "provider", "admin"];
// Simple, pragmatic email shape check - not RFC-perfect, just enough to catch typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Pure validation of signup input. No DB, so it is trivial to unit test. */
export function validateSignup(input: SignupInput): ValidationResult {
  if (!input.name || !input.name.trim()) return { ok: false, error: "Name is required" };
  if (!EMAIL_RE.test(input.email)) return { ok: false, error: "Enter a valid email" };
  if (!input.password || input.password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters" };
  if (!ROLES.includes(input.role)) return { ok: false, error: "Choose a valid role" };
  return { ok: true };
}

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

/**
 * Validate + persist a new user with a hashed password.
 * Providers start `pending` (admin must approve); others are `approved`.
 */
export async function registerUser(input: SignupInput): Promise<RegisterResult> {
  const valid = validateSignup(input);
  if (!valid.ok) return { ok: false, error: valid.error };

  // Store email normalized so lookups (login) always match regardless of case.
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists" };

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role,
      status: initialStatusFor(input.role),
    },
  });
  return { ok: true, userId: user.id };
}
