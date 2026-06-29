import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/server/db"
import { adminGuard, jsonError } from "@/lib/server/admin-auth"
import {
  addWorkflowEvent,
  buildUpdateData,
  createRevision,
  ensureUniqueSlug,
  getActorId,
  getTenantId,
  loadFullPost,
  normalizeContentType,
  normalizeStatus,
  readJson,
  slugify,
  syncBlocks,
  syncSeo,
  syncTaxonomy,
} from "@/lib/server/content-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function getId(context: any) {
  const params = await context.params
  return params.id
}

export async function GET(req: NextRequest, context: any) {
  const blocked = adminGuard(req)
  if (blocked) return blocked

  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getId(context)
    const post = await loadFullPost(client, id)

    if (!post) {
      return jsonError("Content not found", 404)
    }

    return NextResponse.json({
      ok: true,
      data: post,
    })
  } catch (err: any) {
    return jsonError(err.message || "Failed to load content", 500)
  } finally {
    client.release()
  }
}

export async function PATCH(req: NextRequest, context: any) {
  const blocked = adminGuard(req)
  if (blocked) return blocked

  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getId(context)
    const body = await readJson(req)
    const actorId = getActorId(req, body)
    const tenantId = getTenantId(req, body)

    await client.query("begin")

    const before = await client.query(
      `
      select *
      from public.posts
      where id = $1
      limit 1
      `,
      [id]
    )

    if (!before.rowCount) {
      await client.query("rollback")
      return jsonError("Content not found", 404)
    }

    const current = before.rows[0]
    const updateData = buildUpdateData(body)

    if (body.content_type || body.type) {
      updateData.content_type = normalizeContentType(body.content_type || body.type)
    }

    if (body.slug) {
      const contentType = updateData.content_type || current.content_type || "post"
      updateData.slug = await ensureUniqueSlug(
        client,
        current.tenant_id || tenantId,
        contentType,
        slugify(body.slug),
        id
      )
    }

    if (body.status) {
      const nextStatus = normalizeStatus(body.status)
      updateData.status = nextStatus

      if (nextStatus === "published") {
        updateData.published_at = body.published_at || body.publishedAt || new Date()
        updateData.first_published_at = current.first_published_at || new Date()
      }

      if (nextStatus === "archived") {
        updateData.archived_at = new Date()
      }
    }

    if (!Object.keys(updateData).length && !body.seo && !body.categories && !body.tags && !body.blocks) {
      await client.query("rollback")
      return jsonError("No update data supplied", 400)
    }

    let updated = current

    if (Object.keys(updateData).length) {
      const columns = Object.keys(updateData)
      const values = Object.values(updateData)

      const setSql = columns.map((col, i) => `${col} = $${i + 1}`).join(", ")

      const result = await client.query(
        `
        update public.posts
        set ${setSql}
        where id = $${values.length + 1}
        returning *
        `,
        [...values, id]
      )

      updated = result.rows[0]
    }

    await syncSeo(client, updated.tenant_id || tenantId, id, body.seo)
    await syncTaxonomy(client, updated.tenant_id || tenantId, id, body.categories, body.tags)
    await syncBlocks(client, updated.tenant_id || tenantId, id, body.blocks)

    await createRevision(client, updated.tenant_id || tenantId, updated, actorId, body.change_note || "update content")

    if (before.rows[0].status !== updated.status) {
      await addWorkflowEvent(
        client,
        updated.tenant_id || tenantId,
        id,
        actorId,
        "status_changed",
        before.rows[0].status,
        updated.status,
        body.change_note || null
      )
    } else {
      await addWorkflowEvent(
        client,
        updated.tenant_id || tenantId,
        id,
        actorId,
        "updated",
        before.rows[0].status,
        updated.status,
        body.change_note || null
      )
    }

    await client.query("commit")

    return NextResponse.json({
      ok: true,
      message: "Content updated",
      data: updated,
    })
  } catch (err: any) {
    await client.query("rollback")
    return jsonError(err.message || "Failed to update content", 500)
  } finally {
    client.release()
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const blocked = adminGuard(req)
  if (blocked) return blocked

  const pool = getPool()
  const client = await pool.connect()

  try {
    const id = await getId(context)
    const url = new URL(req.url)
    const hard = url.searchParams.get("hard") === "1"
    const actorId = getActorId(req)

    await client.query("begin")

    const before = await client.query(
      `
      select *
      from public.posts
      where id = $1
      limit 1
      `,
      [id]
    )

    if (!before.rowCount) {
      await client.query("rollback")
      return jsonError("Content not found", 404)
    }

    if (hard) {
      await client.query(`delete from public.posts where id = $1`, [id])

      await client.query("commit")

      return NextResponse.json({
        ok: true,
        message: "Content permanently deleted",
      })
    }

    const deleted = await client.query(
      `
      update public.posts
      set
        status = 'deleted',
        deleted_at = now()
      where id = $1
      returning *
      `,
      [id]
    )

    await addWorkflowEvent(
      client,
      before.rows[0].tenant_id,
      id,
      actorId,
      "deleted",
      before.rows[0].status,
      "deleted",
      "soft delete"
    )

    await client.query("commit")

    return NextResponse.json({
      ok: true,
      message: "Content moved to deleted",
      data: deleted.rows[0],
    })
  } catch (err: any) {
    await client.query("rollback")
    return jsonError(err.message || "Failed to delete content", 500)
  } finally {
    client.release()
  }
}
