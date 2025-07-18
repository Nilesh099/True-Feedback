import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token")?.value;
  const url = request.nextUrl;

  const isAuthPage = ["/sign-in", "/sign-up", "/verify", "/"].some(path =>
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const isDashboardPage = url.pathname.startsWith("/dashboard");

  // Redirect authenticated users away from auth pages to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from dashboard to sign-in
  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/dashboard/:path*",
  ],
};
