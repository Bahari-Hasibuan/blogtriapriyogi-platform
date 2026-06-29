import { NextResponse } from "next/server"
import { getContent, updateContent, actionContent } from "@/lib/server/content-service"

export const dynamic = "force-dynamic"

async function getId(ctx: any) {
  const params = await ctx.params
  return params.id
}

export async function GET(_req: Request, ctx: any) {
  try {
    const id = await getId(ctx)
    const data = await getContent(id)

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Content tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal mengambil content" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, ctx: any) {
  try {
    const id = await getId(ctx)
    const body = await req.json()
    const data = await updateContent(id, body)

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Content tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Content berhasil diperbarui",
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal update content" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, ctx: any) {
  try {
    const id = await getId(ctx)
    const data = await actionContent(id, "delete")

    return NextResponse.json({
      ok: true,
      message: "Content dipindahkan ke trash",
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal hapus content" },
      { status: 500 }
    )
  }
}
