import { NextResponse } from "next/server"
import { actionContent } from "@/lib/server/content-service"

export const dynamic = "force-dynamic"

async function getId(ctx: any) {
  const params = await ctx.params
  return params.id
}

export async function POST(req: Request, ctx: any) {
  try {
    const id = await getId(ctx)
    const body = await req.json()
    const action = body.action

    const data = await actionContent(id, action)

    return NextResponse.json({
      ok: true,
      action,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal menjalankan action" },
      { status: 500 }
    )
  }
}
