import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect to appropriate dashboard
  if (token && pathname === "/login") {
    const user = request.cookies.get("user")?.value;
    let role = "developer";
    try {
      if (user) {
        role = JSON.parse(decodeURIComponent(user)).role;
      }
    } catch (e) {
      console.error("Error parsing user cookie:", e);
    }
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // Public routes (login page access for non-authenticated users)
  if (pathname === "/login" && !token) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*", "/developer/:path*", "/"],
};

