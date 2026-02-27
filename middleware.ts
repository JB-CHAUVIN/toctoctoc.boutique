import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes protégées (dashboard)
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isDashboardRoute && !isLoggedIn) {
    const redirectUrl = new URL("/login", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si déjà connecté et on accède à login/register → dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
