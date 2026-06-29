import { query } from "./db"

export type ContentStatus = "draft" | "published" | "archived"
export type ContentType = "post" | "page"

export function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180) || "untitled"
}

export function safeStatus(input: any): ContentStatus {
  if (input === "published") return "published"
  if (input === "archived") return "archived"
  return "draft"
}

export function safeContentType(input: any): ContentType {
  return input === "page" ? "page" : "post"
}

export function wordCount(content: string) {
  return String(content || "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export function readingTime(content: string) {
  const words = wordCount(content)
  return Math.max(1, Math.ceil(words / 200))
}

export async function getTenantId() {
  const slug = process.env.DEFAULT_TENANT_SLUG || "default"

  const found = await query<{ id: string }>(
    "select id from public.tenants where slug = $1 limit 1",
    [slug]
  )

  if (found.rows[0]?.id) return found.rows[0].id

  try {
    const created = await query<{ id: string }>(
      "insert into public.tenants (slug, name) values ($1, $2) returning id",
      [slug, "Default Workspace"]
    )
    return created.rows[0].id
  } catch {
    const created = await query<{ id: string }>(
      "insert into public.tenants (slug) values ($1) returning id",
      [slug]
    )
    return created.rows[0].id
  }
}
