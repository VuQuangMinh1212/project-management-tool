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
  
  // Debug logging for production troubleshooting
  if (pathname.startsWith("/manager") || pathname.startsWith("/staff")) {
    console.log("🔍 Middleware Debug:", {
      pathname,
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
  }

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
    // Prevent redirect loop by checking if already on login page
    if (pathname === "/login") {
      return NextResponse.next();
    }
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

    const isStaffRoute = STAFF_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isManagerRoute = MANAGER_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isStaffRoute && userRole !== "employee") {
      return NextResponse.redirect(
        new URL(ROUTES.MANAGER.DASHBOARD, request.url)
      );
    }

    if (isManagerRoute && userRole !== "manager") {
      return NextResponse.redirect(
        new URL(ROUTES.STAFF.DASHBOARD, request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware token validation error:", error);
    const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
