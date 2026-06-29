import { NextResponse } from "next/server"
import { createContent, listContent } from "@/lib/server/content-service"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const data = await listContent({
      contentType: url.searchParams.get("type") || "all",
      status: url.searchParams.get("status") || "all",
      q: url.searchParams.get("q") || "",
      limit: Number(url.searchParams.get("limit") || 50),
      offset: Number(url.searchParams.get("offset") || 0),
    })

    return NextResponse.json({
      ok: true,
      count: data.length,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Gagal mengambil content",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await createContent(body)

    return NextResponse.json({
      ok: true,
      message: "Content berhasil dibuat",
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Gagal membuat content",
      },
      { status: 500 }
    )
  }
}
