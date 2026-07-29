import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma, no bcrypt) so the middleware can import it.
// The real Credentials provider with DB access lives in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as typeof session.user.role;
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
