import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "triapriyogi.com";
const STUDIO_HOST = "studio.triapriyogi.com";


function isLocalOrPreviewHost(host: string) {
  return (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.endsWith(".github.dev") ||
    host.endsWith(".vercel.app")
  );
}

function isCustomUserDomain(host: string) {
  if (!host) return false;
  if (isLocalOrPreviewHost(host)) return false;
  if (host === ROOT_DOMAIN) return false;
  if (host === `www.${ROOT_DOMAIN}`) return false;
  if (host === STUDIO_HOST) return false;
  if (host.endsWith(`.${ROOT_DOMAIN}`)) return false;
  return true;
}


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

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";
  const url = request.nextUrl.clone();

  const isRoot = host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`;

  if (isRoot && url.pathname === "/dashboard") {
    url.hostname = STUDIO_HOST;
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isRoot && studioOnlyPaths.some((path) => url.pathname.startsWith(path))) {
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url);
  }

  if (host === STUDIO_HOST && url.pathname === "/dashboard") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (host === STUDIO_HOST && rootOnlyPaths.some((path) => url.pathname.startsWith(path))) {
    url.hostname = ROOT_DOMAIN;
    return NextResponse.redirect(url);
  }

  if (host === STUDIO_HOST && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.rewrite(url);
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


  if (isCustomUserDomain(host)) {
    url.pathname = "/custom-domain";
    url.searchParams.set("host", host);
    url.searchParams.set("path", request.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
