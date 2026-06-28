import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "TriApriyogi Studio OS",
    status: "admin route active",
    modules: [
      "editor",
      "ai-tools",
      "seo",
      "domains",
      "analytics",
      "media",
      "templates",
      "payments",
      "admin"
    ]
  })
}
