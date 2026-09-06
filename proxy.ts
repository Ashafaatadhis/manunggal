import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export type ProxyAction =
  | { type: "next" }
  | { type: "redirect"; to: string };

/**
 * Pure decision logic for the auth proxy, extracted so it can be unit-tested
 * without a Next.js runtime. Returns where a request should go based on the
 * pathname and whether a valid session token is present.
 */
export function resolveProxyAction(
  pathname: string,
  hasValidToken: boolean
): ProxyAction {
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedRoute && !hasValidToken) {
    return { type: "redirect", to: "/login" };
  }

  if (isAuthRoute && hasValidToken) {
    return { type: "redirect", to: "/dashboard" };
  }

  return { type: "next" };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const hasValidToken = token ? Boolean(await verifyToken(token)) : false;

  const action = resolveProxyAction(pathname, hasValidToken);

  if (action.type === "redirect") {
    const url = req.nextUrl.clone();
    url.pathname = action.to;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
