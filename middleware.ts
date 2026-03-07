import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Paths to exclude from page view tracking (prefixes)
const TRACKING_EXCLUDE = ["/api", "/_next", "/favicon.ico"];

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

  // Page view tracking (fire-and-forget)
  const shouldTrack = !TRACKING_EXCLUDE.some((p) => nextUrl.pathname.startsWith(p));
  if (shouldTrack) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;

    fetch(`${nextUrl.origin}/api/log/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname: nextUrl.pathname,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        referer: req.headers.get("referer") || undefined,
      }),
    }).catch(() => {});
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
