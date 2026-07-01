import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = "triapriyogi.com";
const STUDIO_HOST = "studio.triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];
const RESERVED_SUBDOMAINS = ["www", "studio", "connect"];

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

function getHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";

  return host
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

function getSubdomain(host: string) {
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (!host.endsWith(`.${ROOT_DOMAIN}`)) {
    return null;
  }

  return host.replace(`.${ROOT_DOMAIN}`, "");
}

function isStudioPath(pathname: string) {
  return studioPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const host = getHost(request);
  const pathname = request.nextUrl.pathname;
  const subdomain = getSubdomain(host);

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (MAIN_HOSTS.includes(host) && isStudioPath(pathname)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url);
  }

  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    const url = request.nextUrl.clone();
    url.pathname = `/site/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
