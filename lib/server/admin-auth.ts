import { NextRequest, NextResponse } from "next/server"

export function jsonError(
  message: string,
  status: number = 400,
  details: unknown = null
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status }
  )
}

export function jsonOk(data: Record<string, unknown> = {}, status: number = 200) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    { status }
  )
}

/**
 * Guard sederhana untuk API admin.
 * Saat ADMIN_API_TOKEN ada, request wajib membawa token.
 * Bisa pakai header:
 * - x-admin-token
 * - Authorization: Bearer TOKEN
 *
 * Saat ADMIN_API_TOKEN kosong, guard dilewati agar development lokal tidak terkunci.
 */
export function adminGuard(req: NextRequest) {
  const token = process.env.ADMIN_API_TOKEN

  if (!token) return null

  const fromHeader =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "").trim()

  if (fromHeader !== token) {
    return jsonError("Unauthorized admin request", 401)
  }

  return null
}
