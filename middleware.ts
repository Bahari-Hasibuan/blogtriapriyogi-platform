import { NextRequest, NextResponse } from "next/server";

const STUDIO_HOST = "studio.triapriyogi.com";
const MAIN_HOST = "triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];

const studioOnlyPaths = [
  "/dashboard",
  "/admin",
  "/editor",
  "/page-editor",
  "/posts",
  "/analytics",
  "/settings",
  "/profile",
  "/studio",
];

const authPaths = [
  "/login",
  "/signup",
  "/forgot-password",
];

function isPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url, 307);
  }

  if (host === STUDIO_HOST && isPath(pathname, authPaths)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = MAIN_HOST;
    return NextResponse.redirect(url, 307);
  }

  if (MAIN_HOSTS.includes(host) && isPath(pathname, studioOnlyPaths)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
