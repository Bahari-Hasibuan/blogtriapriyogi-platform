import { NextRequest, NextResponse } from "next/server"
import { query } from "../../../../../lib/server/db"

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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const result = await query(
      "select * from public.posts where id = $1 limit 1",
      [id]
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { ok: false, error: "Content not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: result.rows[0],
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const sets: string[] = []
    const params: any[] = []

    function setField(column: string, value: any) {
      params.push(value)
      sets.push(`${column} = $${params.length}`)
    }

    if (body.title !== undefined) setField("title", body.title)
    if (body.slug !== undefined) setField("slug", slugify(body.slug))
    if (body.excerpt !== undefined) setField("excerpt", body.excerpt)
    if (body.content !== undefined) setField("content", body.content)
    if (body.content_type !== undefined) setField("content_type", body.content_type)
    if (body.featured_image_url !== undefined) setField("featured_image_url", body.featured_image_url)
    if (body.meta_title !== undefined) setField("meta_title", body.meta_title)
    if (body.meta_description !== undefined) setField("meta_description", body.meta_description)
    if (body.canonical_url !== undefined) setField("canonical_url", body.canonical_url)
    if (body.schema_json !== undefined) setField("schema_json", body.schema_json)
    if (body.word_count !== undefined) setField("word_count", body.word_count)
    if (body.reading_time !== undefined) setField("reading_time", body.reading_time)

    if (body.action === "publish") {
      setField("status", "published")
      sets.push("published_at = now()")
      sets.push("archived_at = null")
      sets.push("deleted_at = null")
    }

    if (body.action === "draft") {
      setField("status", "draft")
      sets.push("archived_at = null")
      sets.push("deleted_at = null")
    }

    if (body.action === "archive") {
      setField("status", "archived")
      sets.push("archived_at = now()")
    }

    if (body.action === "restore") {
      setField("status", "draft")
      sets.push("archived_at = null")
      sets.push("deleted_at = null")
    }

    if (body.status !== undefined && !body.action) {
      setField("status", body.status)
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Tidak ada data yang diubah" },
        { status: 400 }
      )
    }

    sets.push("updated_at = now()")
    params.push(id)

    const result = await query(
      `
      update public.posts
      set ${sets.join(", ")}
      where id = $${params.length}
      returning *
      `,
      params
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { ok: false, error: "Content not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Content updated",
      data: result.rows[0],
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const result = await query(
      `
      update public.posts
      set deleted_at = now(),
          status = 'archived',
          updated_at = now()
      where id = $1
      returning *
      `,
      [id]
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { ok: false, error: "Content not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Content deleted",
      data: result.rows[0],
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
