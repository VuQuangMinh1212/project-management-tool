import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ROUTES,
  PUBLIC_ROUTES,
  STAFF_ROUTES,
  MANAGER_ROUTES,
} from "@/constants/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname as "/" | "/login" | "/register")) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  // Parse token to get user role (in production, verify token signature)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role; // Role is directly in payload, not payload.user.role

    // Check token expiry to avoid processing expired tokens
    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    // Check role-based access
    if (
      STAFF_ROUTES.some((route) => pathname.startsWith(route)) &&
      userRole !== "employee" // Backend uses "employee" not "staff"
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.MANAGER.DASHBOARD, request.url)
      );
    }

    if (
      MANAGER_ROUTES.some((route) => pathname.startsWith(route)) &&
      userRole !== "manager"
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.STAFF.DASHBOARD, request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
