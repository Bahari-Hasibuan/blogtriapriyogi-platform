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

async function getRouteId(context: any) {
  const params = await Promise.resolve(context?.params)
  return String(params?.id || "").trim()
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
  if (status === "draft") return "draft"
  if (status === "archive") return "archived"
  if (status === "archived") return "archived"
  if (status === "restore") return "draft"

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
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
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

async function createRevision(client: any, tenantId: string, postId: string) {
  try {
    const current = await client.query(
      `
      select *
      from public.posts
      where id = $1
        and tenant_id = $2
      limit 1
      `,
      [postId, tenantId]
    )

    const post = current.rows?.[0]

    if (!post) return

    await client.query(
      `
      insert into public.post_revisions
        (post_id, tenant_id, title, slug, excerpt, content, status, created_at, snapshot)
      values
        ($1, $2, $3, $4, $5, $6, $7, now(), $8::jsonb)
      `,
      [
        post.id,
        tenantId,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.status,
        JSON.stringify(post),
      ]
    )
  } catch {
    // revision optional
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
    // audit optional
  }
}

export async function GET(req: NextRequest, context: any) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getRouteId(context)

    if (!id) {
      return jsonError("Content id wajib diisi", 400)
    }

    const tenantId = await getTenantId(client, req, {})

    const result = await client.query(
      `
      select *
      from public.posts
      where id = $1
        and tenant_id = $2
        and deleted_at is null
      limit 1
      `,
      [id, tenantId]
    )

    const post = result.rows?.[0]

    if (!post) {
      return jsonError("Content not found", 404)
    }

    return jsonOk({ data: post })
  } catch (err: any) {
    return jsonError(err?.message || "Failed to load content", 500)
  } finally {
    client.release()
  }
}

export async function PATCH(req: NextRequest, context: any) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getRouteId(context)

    if (!id) {
      return jsonError("Content id wajib diisi", 400)
    }

    const body = await readJson(req)
    const tenantId = await getTenantId(client, req, body)
    const actorId = getActorId(req, body)

    await createRevision(client, tenantId, id)

    const title = String(body.title || "Tanpa judul").trim()
    const content = String(body.content || "")
    const words = countWords(content)
    const status = normalizeStatus(body.status)
    const contentType = normalizeContentType(body.content_type || body.type)
    const slug = slugify(body.slug || title)

    const result = await client.query(
      `
      update public.posts
      set
        title = $1,
        slug = $2,
        excerpt = $3,
        content = $4,
        cover_image_url = $5,
        featured_image_url = $6,
        status = $7,
        content_type = $8,
        meta_title = $9,
        meta_description = $10,
        canonical_url = $11,
        schema_json = $12::jsonb,
        seo_keywords = $13,
        visibility = $14,
        language = $15,
        word_count = $16,
        reading_time = $17,
        updated_at = now(),
        published_at = case
          when $7 = 'published' then coalesce(published_at, now())
          else published_at
        end,
        archived_at = case
          when $7 = 'archived' then now()
          when $7 = 'draft' then null
          when $7 = 'published' then null
          else archived_at
        end
      where id = $18
        and tenant_id = $19
        and deleted_at is null
      returning *
      `,
      [
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
        id,
        tenantId,
      ]
    )

    const post = result.rows?.[0]

    if (!post) {
      return jsonError("Content not found", 404)
    }

    await writeAuditLog(client, tenantId, actorId, id, "content:update", {
      status,
      content_type: contentType,
      source: "admin-content-id-route",
    })

    return jsonOk({
      message: "Content updated",
      data: post,
    })
  } catch (err: any) {
    return jsonError(err?.message || "Failed to update content", 500)
  } finally {
    client.release()
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getRouteId(context)

    if (!id) {
      return jsonError("Content id wajib diisi", 400)
    }

    const body = await readJson(req)
    const tenantId = await getTenantId(client, req, body)
    const actorId = getActorId(req, body)

    const result = await client.query(
      `
      update public.posts
      set
        deleted_at = now(),
        updated_at = now()
      where id = $1
        and tenant_id = $2
        and deleted_at is null
      returning id
      `,
      [id, tenantId]
    )

    if (!result.rows?.[0]) {
      return jsonError("Content not found", 404)
    }

    await writeAuditLog(client, tenantId, actorId, id, "content:delete", {
      source: "admin-content-id-route",
    })

    return jsonOk({
      message: "Content deleted",
      id: result.rows[0].id,
    })
  } catch (err: any) {
    return jsonError(err?.message || "Failed to delete content", 500)
  } finally {
    client.release()
  }
}
