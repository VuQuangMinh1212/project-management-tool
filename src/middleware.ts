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

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    if (payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(
        new URL(ROUTES.LOGIN, request.url)
      );
      response.cookies.delete("auth_token");
      return response;
    }

    if (STAFF_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== "employee") {
        return NextResponse.redirect(
          new URL(ROUTES.MANAGER.DASHBOARD, request.url)
        );
      }
      return NextResponse.next();
    }

    if (MANAGER_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== "manager") {
        return NextResponse.redirect(
          new URL(ROUTES.STAFF.DASHBOARD, request.url)
        );
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
