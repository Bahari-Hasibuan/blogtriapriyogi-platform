import { NextResponse } from "next/server"
import { trackAnalytics } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await trackAnalytics(body, req)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
