import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "triapriyogi.com";
const STUDIO_HOST = "studio.triapriyogi.com";

const reservedSubdomains = new Set([
  "www",
  "studio",
  "workspace",
  "app",
  "admin",
  "api",
  "auth",
  "login",
  "dashboard",
  "editor",
]);

const studioOnlyPaths = [
  "/dashboard",
  "/editor",
  "/onboarding",
  "/settings",
];

const rootOnlyPaths = [
  "/login",
  "/signup",
  "/forgot-password",
];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";
  const url = request.nextUrl.clone();

  const isRoot = host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`;

  if (isRoot && studioOnlyPaths.some((path) => url.pathname.startsWith(path))) {
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url);
  }

  if (host === STUDIO_HOST && rootOnlyPaths.some((path) => url.pathname.startsWith(path))) {
    url.hostname = ROOT_DOMAIN;
    return NextResponse.redirect(url);
  }

  if (host === STUDIO_HOST && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    host.endsWith(`.${ROOT_DOMAIN}`) &&
    host !== ROOT_DOMAIN &&
    host !== `www.${ROOT_DOMAIN}` &&
    host !== STUDIO_HOST
  ) {
    const subdomain = host.replace(`.${ROOT_DOMAIN}`, "");

    if (!reservedSubdomains.has(subdomain)) {
      if (url.pathname === "/") {
        url.pathname = `/${subdomain}`;
      } else {
        url.pathname = `/${subdomain}${url.pathname}`;
      }

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
