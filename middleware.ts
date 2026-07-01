import { NextRequest, NextResponse } from "next/server";

const STUDIO_HOST = "studio.triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];

const studioPaths = [
  "/dashboard",
  "/admin",
  "/editor",
  "/page-editor",
  "/posts",
  "/analytics",
  "/settings",
  "/profile",
  "/login",
  "/signup",
  "/forgot-password",
];

function isStudioPath(pathname: string) {
  return studioPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.rewrite(url);
  }

  if (MAIN_HOSTS.includes(host) && isStudioPath(pathname)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
