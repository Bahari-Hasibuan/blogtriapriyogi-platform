import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/server/db"
import { adminGuard, jsonError } from "@/lib/server/admin-auth"
import {
  addWorkflowEvent,
  buildInsertData,
  createRevision,
  ensureUniqueSlug,
  getActorId,
  getTenantId,
  normalizeContentType,
  readJson,
  slugify,
  syncBlocks,
  syncSeo,
  syncTaxonomy,
} from "@/lib/server/content-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const blocked = adminGuard(req)
  if (blocked) return blocked

  try {
    const pool = getPool()
    const url = new URL(req.url)

    const page = Math.max(Number(url.searchParams.get("page") || 1), 1)
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 100)
    const offset = (page - 1) * limit

    const tenantId = getTenantId(req)
    const allTenants = url.searchParams.get("allTenants") === "1"
    const type = url.searchParams.get("type") || url.searchParams.get("content_type")
    const status = url.searchParams.get("status")
    const q = url.searchParams.get("q")

    const sortAllow = new Set(["created_at", "updated_at", "published_at", "title", "view_count"])
    const sort = sortAllow.has(url.searchParams.get("sort") || "")
      ? String(url.searchParams.get("sort"))
      : "updated_at"

    const dir = String(url.searchParams.get("dir") || "desc").toLowerCase() === "asc" ? "asc" : "desc"

    const where: string[] = ["p.deleted_at is null"]
    const params: any[] = []

    if (!allTenants) {
      params.push(tenantId)
      where.push(`p.tenant_id is not distinct from $${params.length}`)
    }

    if (type) {
      params.push(normalizeContentType(type))
      where.push(`p.content_type = $${params.length}`)
    }

    if (status) {
      params.push(status)
      where.push(`p.status = $${params.length}`)
    }

    if (q) {
      params.push(`%${q}%`)
      where.push(`(p.title ilike $${params.length} or p.slug ilike $${params.length} or p.excerpt ilike $${params.length})`)
    }

    const whereSql = where.length ? `where ${where.join(" and ")}` : ""

    const count = await pool.query(
      `
      select count(*)::int as total
      from public.admin_content_overview p
      ${whereSql}
      `,
      params
    )

    const rows = await pool.query(
      `
      select *
      from public.admin_content_overview p
      ${whereSql}
      order by ${sort} ${dir}
      limit $${params.length + 1}
      offset $${params.length + 2}
      `,
      [...params, limit, offset]
    )

    return NextResponse.json({
      ok: true,
      data: rows.rows,
      pagination: {
        page,
        limit,
        total: count.rows[0]?.total || 0,
        total_pages: Math.ceil((count.rows[0]?.total || 0) / limit),
      },
    })
  } catch (err: any) {
    return jsonError(err.message || "Failed to load content", 500)
  }
}

export async function POST(req: NextRequest) {
  const blocked = adminGuard(req)
  if (blocked) return blocked

  const pool = getPool()
  const client = await pool.connect()

  try {
    const body = await readJson(req)
    const tenantId = getTenantId(req, body)
    const actorId = getActorId(req, body)
    const contentType = normalizeContentType(body.content_type || body.type || "post")
    const rawSlug = body.slug || body.title || "untitled"
    const slug = await ensureUniqueSlug(client, tenantId, contentType, slugify(rawSlug))

    const data = buildInsertData(
      {
        ...body,
        content_type: contentType,
      },
      tenantId,
      actorId,
      slug
    )

    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = columns.map((_, i) => `$${i + 1}`)

    await client.query("begin")

    const inserted = await client.query(
      `
      insert into public.posts (${columns.join(", ")})
      values (${placeholders.join(", ")})
      returning *
      `,
      values
    )

    const post = inserted.rows[0]

    await syncSeo(client, tenantId, post.id, body.seo)
    await syncTaxonomy(client, tenantId, post.id, body.categories, body.tags)
    await syncBlocks(client, tenantId, post.id, body.blocks)

    await createRevision(client, tenantId, post, actorId, "create content")
    await addWorkflowEvent(client, tenantId, post.id, actorId, "created", null, post.status, "content created")

    await client.query("commit")

    return NextResponse.json(
      {
        ok: true,
        message: "Content created",
        data: post,
      },
      { status: 201 }
    )
  } catch (err: any) {
    await client.query("rollback")
    return jsonError(err.message || "Failed to create content", 500)
  } finally {
    client.release()
  }
}
