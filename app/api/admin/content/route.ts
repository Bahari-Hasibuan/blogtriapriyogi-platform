import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/server/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function jsonOk(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status })
}

function jsonError(message: string, status = 400, details: unknown = null) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status }
  )
}

async function readJson(req: NextRequest) {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

function normalizeContentType(value: unknown) {
  const type = String(value || "post").toLowerCase().trim()
  return type === "page" ? "page" : "post"
}

function normalizeStatus(value: unknown) {
  const status = String(value || "draft").toLowerCase().trim()

  if (status === "publish") return "published"
  if (status === "published") return "published"
  if (status === "archive") return "archived"
  if (status === "archived") return "archived"
  if (status === "restore") return "draft"
  if (status === "draft") return "draft"

  return "draft"
}

function slugify(value: unknown) {
  const base = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return base || `content-${Date.now()}`
}

function countWords(value: unknown) {
  const text = String(value || "").replace(/<[^>]*>/g, " ").trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

function getReadingTime(words: number) {
  return Math.max(1, Math.ceil(words / 200))
}

function getActorId(req: NextRequest, body: any) {
  return (
    body?.actor_id ||
    body?.user_id ||
    req.headers.get("x-user-id") ||
    req.headers.get("x-admin-id") ||
    null
  )
}

async function getTenantId(client: any, req: NextRequest, body: any) {
  if (body?.tenant_id) return String(body.tenant_id)
  if (body?.workspace_id) return String(body.workspace_id)

  const fromHeader =
    req.headers.get("x-tenant-id") ||
    req.headers.get("x-tenant") ||
    req.headers.get("x-workspace")

  if (fromHeader) return fromHeader

  const result = await client.query(
    `
    select id
    from public.tenants
    order by created_at asc nulls last
    limit 1
    `
  )

  const tenantId = result.rows?.[0]?.id

  if (!tenantId) {
    throw new Error("Tenant belum ada di database")
  }

  return tenantId
}

async function ensureUniqueSlug(
  client: any,
  tenantId: string,
  baseSlug: string,
  excludeId: string | null = null
) {
  let slug = baseSlug
  let index = 2

  while (true) {
    const result = await client.query(
      `
      select id
      from public.posts
      where tenant_id = $1
        and slug = $2
        and deleted_at is null
        and ($3::uuid is null or id <> $3::uuid)
      limit 1
      `,
      [tenantId, slug, excludeId]
    )

    if (!result.rows?.[0]) return slug

    slug = `${baseSlug}-${index}`
    index++
  }
}

async function writeAuditLog(
  client: any,
  tenantId: string,
  actorId: string | null,
  postId: string,
  action: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await client.query(
      `
      insert into public.admin_audit_logs
        (tenant_id, actor_id, entity_type, entity_id, action, metadata)
      values
        ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [
        tenantId,
        actorId,
        "content",
        postId,
        action,
        JSON.stringify(metadata),
      ]
    )
  } catch {
    // audit log opsional
  }
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type") || url.searchParams.get("content_type")
    const search = url.searchParams.get("q") || ""
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100)
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1)
    const offset = (page - 1) * limit

    const tenantId = await getTenantId(client, req, {})

    const params: any[] = [tenantId]
    const where: string[] = [
      "tenant_id = $1",
      "deleted_at is null",
    ]

    if (status && status !== "all") {
      params.push(normalizeStatus(status))
      where.push(`status = $${params.length}`)
    }

    if (type && type !== "all") {
      params.push(normalizeContentType(type))
      where.push(`content_type = $${params.length}`)
    }

    if (search) {
      params.push(`%${search}%`)
      where.push(`(title ilike $${params.length} or slug ilike $${params.length} or excerpt ilike $${params.length})`)
    }

    params.push(limit)
    const limitIndex = params.length

    params.push(offset)
    const offsetIndex = params.length

    const result = await client.query(
      `
      select
        id,
        tenant_id,
        title,
        slug,
        excerpt,
        content_type,
        status,
        cover_image_url,
        featured_image_url,
        meta_title,
        meta_description,
        canonical_url,
        visibility,
        language,
        word_count,
        reading_time,
        view_count,
        like_count,
        comment_count,
        published_at,
        created_at,
        updated_at,
        archived_at,
        deleted_at
      from public.posts
      where ${where.join(" and ")}
      order by updated_at desc nulls last, created_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
      `,
      params
    )

    const countResult = await client.query(
      `
      select count(*)::int as total
      from public.posts
      where ${where.join(" and ")}
      `,
      params.slice(0, params.length - 2)
    )

    return jsonOk({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows?.[0]?.total || 0,
      },
    })
  } catch (err: any) {
    return jsonError(err?.message || "Failed to load content", 500)
  } finally {
    client.release()
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const body = await readJson(req)
    const tenantId = await getTenantId(client, req, body)
    const actorId = getActorId(req, body)

    const title = String(body.title || "Tanpa judul").trim()
    const content = String(body.content || "")
    const words = countWords(content)

    const contentType = normalizeContentType(body.content_type || body.type)
    const status = normalizeStatus(body.status)
    const baseSlug = slugify(body.slug || title)
    const slug = await ensureUniqueSlug(client, tenantId, baseSlug)

    const result = await client.query(
      `
      insert into public.posts (
        tenant_id,
        author_id,
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        featured_image_url,
        status,
        content_type,
        meta_title,
        meta_description,
        canonical_url,
        schema_json,
        seo_keywords,
        visibility,
        language,
        word_count,
        reading_time,
        published_at,
        archived_at,
        created_at,
        updated_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14::jsonb, $15,
        $16, $17, $18, $19,
        case when $9 = 'published' then now() else null end,
        case when $9 = 'archived' then now() else null end,
        now(),
        now()
      )
      returning *
      `,
      [
        tenantId,
        actorId,
        title,
        slug,
        body.excerpt || "",
        content,
        body.cover_image_url || body.featured_image_url || null,
        body.featured_image_url || body.cover_image_url || null,
        status,
        contentType,
        body.meta_title || title,
        body.meta_description || body.excerpt || "",
        body.canonical_url || null,
        JSON.stringify(body.schema_json || {}),
        body.seo_keywords || null,
        body.visibility || "public",
        body.language || "id",
        words,
        getReadingTime(words),
      ]
    )

    const post = result.rows?.[0]

    await writeAuditLog(client, tenantId, actorId, post.id, "content:create", {
      status,
      content_type: contentType,
    })

    return jsonOk(
      {
        message: "Content created",
        data: post,
      },
      201
    )
  } catch (err: any) {
    return jsonError(err?.message || "Failed to create content", 500)
  } finally {
    client.release()
  }
}
