import { NextRequest, NextResponse } from "next/server";

const MAIN_DOMAIN = "triapriyogi.com";
const STUDIO_DOMAIN = "studio.triapriyogi.com";

const ROOT_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];
const STUDIO_PATHS = ["/dashboard", "/editor", "/onboarding", "/settings"];

function cleanHost(host: string) {
  return host
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(":")[0]
    .replace(/\.$/, "");
}

function stripWww(host: string) {
  return host.startsWith("www.") ? host.slice(4) : host;
}

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|json|woff|woff2|ttf)$/i.test(pathname)
  );
}

function startsWithAny(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function restPath(pathname: string) {
  return pathname === "/" ? "" : pathname;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const host = cleanHost(req.headers.get("host") || "");

  if (!host || isAssetPath(pathname)) {
    return NextResponse.next();
  }

  if (isLocalHost(host)) {
    return NextResponse.next();
  }

  const isMainDomain = host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`;
  const isStudioDomain = host === STUDIO_DOMAIN;

  // MAIN DOMAIN: triapriyogi.com = landing page
  if (isMainDomain) {
    if (pathname === "/dashboard") {
      url.hostname = STUDIO_DOMAIN;
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (startsWithAny(pathname, STUDIO_PATHS)) {
      url.hostname = STUDIO_DOMAIN;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // STUDIO DOMAIN: studio.triapriyogi.com = ruang kerja
  if (isStudioDomain) {
    if (pathname === "/dashboard") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (startsWithAny(pathname, ROOT_ONLY_PATHS)) {
      url.hostname = MAIN_DOMAIN;
      return NextResponse.redirect(url);
    }

    if (pathname === "/") {
      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // CUSTOMER DOMAIN:
  // budi.com
  // www.budi.com
  // nama1.nama2.com
  // domain level dua seperti web.id / my.id
  // semuanya dianggap domain user dan diteruskan ke /site/[domain]
  if (pathname.startsWith("/site/")) {
    return NextResponse.next();
  }

  const customerDomain = stripWww(host);

  url.pathname = `/site/${customerDomain}${restPath(pathname)}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
