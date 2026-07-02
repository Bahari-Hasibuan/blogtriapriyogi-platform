import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const protectedRoutes = ["/editor", "/dashboard", "/cms"]

  const isProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  const token = req.cookies.get("sb-access-token")?.value

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}
