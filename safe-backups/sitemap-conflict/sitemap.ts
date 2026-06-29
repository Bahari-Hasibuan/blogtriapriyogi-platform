import type { MetadataRoute } from "next"
import { query } from "@/lib/server/db"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studio.triapriyogi.com"

  const res = await query(`
    select slug, content_type, updated_at
    from public.posts
    where status = 'published'
    and deleted_at is null
    order by updated_at desc
    limit 50000
  `)

  return res.rows.map((item: any) => ({
    url: `${siteUrl}/${item.content_type === "page" ? item.slug : `blog/${item.slug}`}`,
    lastModified: item.updated_at,
    changeFrequency: "daily",
    priority: item.content_type === "page" ? 0.8 : 0.7,
  }))
}
