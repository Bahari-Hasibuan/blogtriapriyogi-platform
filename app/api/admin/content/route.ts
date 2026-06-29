import { NextRequest, NextResponse } from "next/server"
import { query } from "../../../../lib/server/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function getDefaultTenantId() {
  const result = await query<{ id: string }>(
    "select id from public.tenants order by created_at asc limit 1"
  )

  return result.rows[0]?.id || null
}

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams
    const contentType = search.get("content_type")
    const status = search.get("status")
    const q = search.get("q")
    const limit = Math.min(Number(search.get("limit") || 50), 100)
    const offset = Number(search.get("offset") || 0)

    const where: string[] = ["deleted_at is null"]
    const params: any[] = []

    if (contentType) {
      params.push(contentType)
      where.push(`content_type = $${params.length}`)
    }

    if (status) {
      params.push(status)
      where.push(`status = $${params.length}`)
    }

    if (q) {
      params.push(`%${q}%`)
      where.push(`(title ilike $${params.length} or slug ilike $${params.length})`)
    }

    params.push(limit)
    const limitParam = params.length

    params.push(offset)
    const offsetParam = params.length

    const result = await query(
      `
      select
        id,
        tenant_id,
        content_type,
        title,
        slug,
        excerpt,
        status,
        featured_image_url,
        view_count,
        published_at,
        archived_at,
        created_at,
        updated_at
      from public.posts
      where ${where.join(" and ")}
      order by updated_at desc
      limit $${limitParam}
      offset $${offsetParam}
      `,
      params
    )

    return NextResponse.json({
      ok: true,
      count: result.rowCount,
      data: result.rows,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const title = body.title || "Untitled"
    const slug = body.slug ? slugify(body.slug) : slugify(title)
    const contentType = body.content_type === "page" ? "page" : "post"
    const status = body.status || "draft"
    const tenantId = body.tenant_id || await getDefaultTenantId()

    const result = await query(
      `
      insert into public.posts (
        tenant_id,
        content_type,
        title,
        slug,
        excerpt,
        content,
        status,
        featured_image_url,
        meta_title,
        meta_description,
        canonical_url,
        schema_json,
        word_count,
        reading_time,
        published_at,
        updated_at
      )
      values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,
        case when $7 = 'published' then now() else null end,
        now()
      )
      returning *
      `,
      [
        tenantId,
        contentType,
        title,
        slug,
        body.excerpt || "",
        body.content || "",
        status,
        body.featured_image_url || null,
        body.meta_title || title,
        body.meta_description || body.excerpt || "",
        body.canonical_url || null,
        body.schema_json || {},
        body.word_count || 0,
        body.reading_time || 0,
      ]
    )

    return NextResponse.json({
      ok: true,
      message: "Content created",
      data: result.rows[0],
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
