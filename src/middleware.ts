import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ROUTES,
  PUBLIC_ROUTES,
  STAFF_ROUTES,
  MANAGER_ROUTES,
} from "@/constants/routes";

export function middleware(request: NextRequest) {
  // Tạm thời tắt middleware để debug redirect loop
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
