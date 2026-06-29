import { NextRequest, NextResponse } from "next/server"

export function jsonError(message: string, status = 400, details: unknown = null) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status }
  )
}

export function adminGuard(req: NextRequest) {
  const token = process.env.ADMIN_API_TOKEN

  if (!token) return null

  const incoming =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "")

  if (incoming !== token) {
    return jsonError("Unauthorized admin request", 401)
  }

  return null
}
