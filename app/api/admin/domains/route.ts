import { NextResponse } from "next/server"
import { createDomain, listDomains } from "@/lib/server/admin-modules"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await listDomains()
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = await createDomain(body)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
