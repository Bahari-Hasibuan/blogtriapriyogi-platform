import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://studio.triapriyogi.com"

  const txt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
