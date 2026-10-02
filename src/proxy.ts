import { NextResponse, type NextProxy } from "next/server";
import { auth } from "@/auth";
import { LOCALE_COOKIE, LOCALE_HEADER } from "@/lib/i18n/locale-keys";

const requireSession = auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}) as unknown as NextProxy;

const proxy: NextProxy = (req, event) => {
  const { pathname } = req.nextUrl;

  // Public Spanish pages: the language is in the URL. Tell the root layout
  // (<html lang>, dictionary), and remember the choice so the sign-in screens
  // and the app follow it too. These pages are public, so they skip the
  // session check (and the auth cookies it would set).
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(LOCALE_HEADER, "es");
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (req.cookies.get(LOCALE_COOKIE)?.value !== "es") {
      response.cookies.set(LOCALE_COOKIE, "es", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return response;
  }

  return requireSession(req, event);
};

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*", "/clubs/:path*", "/es/:path*"],
};
