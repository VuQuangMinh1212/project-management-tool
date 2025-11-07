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

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    if (
      STAFF_ROUTES.some((route) => pathname.startsWith(route)) &&
      userRole !== "employee"
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
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
