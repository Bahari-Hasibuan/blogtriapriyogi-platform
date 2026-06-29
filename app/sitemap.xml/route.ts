import { NextResponse } from "next/server"
import { Pool } from "pg"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function pool() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DB_URL

  if (!url) throw new Error("DATABASE_URL belum tersedia")

  return new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  })
}

export async function GET() {
  const db = pool()

  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "https://studio.triapriyogi.com"

    const result = await db.query(`
      select content_type, slug, updated_at, published_at
      from public.posts
      where status = 'published'
        and deleted_at is null
      order by published_at desc nulls last
      limit 50000
    `)

    const urls = result.rows
      .map((item) => {
        const path =
          item.content_type === "page"
            ? `/${item.slug}`
            : `/blog/${item.slug}`

        const loc = `${siteUrl}${path}`
        const lastmod = new Date(item.updated_at || item.published_at || Date.now()).toISOString()

        return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${item.content_type === "page" ? "0.8" : "0.7"}</priority>
  </url>`
      })
      .join("")

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    })
  } catch (error: any) {
    return new NextResponse(`Sitemap error: ${error.message}`, { status: 500 })
  } finally {
    await db.end()
  }
}
