import { NextResponse } from "next/server"
import { createTemplate, listTemplates } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await listTemplates()
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await createTemplate(body)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
