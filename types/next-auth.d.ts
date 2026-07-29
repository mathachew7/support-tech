import type { Role } from "@/lib/auth/access";
import type { DefaultSession } from "next-auth";

// Teach next-auth about our `role` so callbacks/middleware are type-safe.
declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: { id?: string; role?: Role } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
