import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "triapriyogi.com";

const workspaceHosts = new Set([
  "studio.triapriyogi.com",
  "workspace.triapriyogi.com",
  "app.triapriyogi.com",
]);

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
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";
  const url = request.nextUrl.clone();

  if (workspaceHosts.has(host) && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    host.endsWith(`.${ROOT_DOMAIN}`) &&
    host !== ROOT_DOMAIN &&
    !workspaceHosts.has(host)
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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
