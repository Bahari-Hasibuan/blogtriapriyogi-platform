import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "TriApriyogi Studio OS",
    version: "admin-v1",
    modules: [
      "editor",
      "ai-tools",
      "seo",
      "domains",
      "analytics",
      "media",
      "templates",
      "payments",
      "users"
    ]
  })
}
