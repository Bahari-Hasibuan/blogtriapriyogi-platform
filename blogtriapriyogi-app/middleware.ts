import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantFromHost } from "./lib/tenant";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const tenant = getTenantFromHost(host);

  const url = req.nextUrl;

  // inject tenant ke header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant", tenant);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
