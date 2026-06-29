import { NextResponse } from "next/server"
import { verifyDomain } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function POST(_req: Request, ctx: any) {
  try {
    const params = await ctx.params
    const data = await verifyDomain(params.id)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
