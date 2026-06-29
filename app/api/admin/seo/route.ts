import { NextResponse } from "next/server"
import { getSeo, upsertSeo } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const postId = url.searchParams.get("post_id")
    if (!postId) return NextResponse.json({ ok: false, error: "post_id wajib diisi" }, { status: 400 })

    const data = await getSeo(postId)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await upsertSeo(body)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
