import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return undefined;
  }

  const isPublicPage = req.nextUrl.pathname.startsWith("/public");

  if (isPublicPage) {
    return undefined;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.webp|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.pdf$).*)"],
};
