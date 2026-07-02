import { NextRequest, NextResponse } from "next/server";

const MAIN_HOST = "triapriyogi.com";
const STUDIO_HOST = "studio.triapriyogi.com";
const CONNECT_HOST = "connect.triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];
const RESERVED = ["www", "studio", "connect"];

const studioPaths = [
  "/dashboard",
  "/builder",
  "/library",
  "/domains",
  "/settings",
  "/editor",
  "/posts",
  "/page-editor",
  "/analytics",
  "/admin",
  "/profile"
];

function isPath(pathname: string, list: string[]) {
  return list.some((item) => pathname === item || pathname.startsWith(`${item}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";
  const pathname = request.nextUrl.pathname;

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url, 307);
  }

  if (host === STUDIO_HOST && ["/login", "/signup", "/forgot-password"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.hostname = MAIN_HOST;
    return NextResponse.redirect(url, 307);
  }

  if (MAIN_HOSTS.includes(host) && isPath(pathname, studioPaths)) {
    const url = request.nextUrl.clone();
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url, 307);
  }

  if (host.endsWith(".triapriyogi.com") && host !== STUDIO_HOST && host !== CONNECT_HOST) {
    const sub = host.replace(".triapriyogi.com", "");

    if (!RESERVED.includes(sub)) {
      const url = request.nextUrl.clone();
      url.pathname = `/site/${sub}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (
    host &&
    !MAIN_HOSTS.includes(host) &&
    host !== STUDIO_HOST &&
    host !== CONNECT_HOST &&
    !host.endsWith(".vercel.app") &&
    !host.endsWith(".github.dev") &&
    !host.includes("localhost")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/site/custom/${host}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
