import { NextResponse } from "next/server"
import { analyticsSummary } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await analyticsSummary()
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
