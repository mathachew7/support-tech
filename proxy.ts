import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth/auth.config";
import { canAccess } from "@/lib/auth/access";

// Edge-safe auth instance (no providers/Prisma) - just enough to read the JWT.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const role = req.auth?.user?.role ?? null;
  const { pathname } = req.nextUrl;

  // Already signed in? Keep them out of the auth pages - send to their dashboard.
  if (role && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!canAccess(role, pathname)) {
    const url = req.nextUrl.clone();
    if (!role) {
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
    } else {
      url.pathname = "/forbidden";
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// Only run the guard on role-gated areas; everything else is public for now.
export const config = {
  matcher: [
    "/login",
    "/signup",
    "/admin/:path*",
    "/providers/dashboard/:path*",
    "/seekers/dashboard/:path*",
  ],
};
