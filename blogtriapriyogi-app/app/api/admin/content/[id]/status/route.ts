import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/server/db"
import { adminGuard, jsonError } from "@/lib/server/admin-auth"
import {
  addWorkflowEvent,
  createRevision,
  getActorId,
  normalizeStatus,
  readJson,
} from "@/lib/server/content-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function getId(context: any) {
  const params = await context.params
  return params.id
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
    const nextStatus = normalizeStatus(body.status)

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

    const result = await client.query(
      `
      update public.posts
      set
        status = $1,
        published_at = case
          when $1 = 'published' and published_at is null then now()
          when $1 = 'draft' then null
          else published_at
        end,
        first_published_at = case
          when $1 = 'published' and first_published_at is null then now()
          else first_published_at
        end,
        archived_at = case
          when $1 = 'archived' then now()
          else archived_at
        end,
        deleted_at = case
          when $1 = 'deleted' then now()
          else deleted_at
        end
      where id = $2
      returning *
      `,
      [nextStatus, id]
    )

    const updated = result.rows[0]

    await createRevision(client, current.tenant_id, updated, actorId, `status changed to ${nextStatus}`)

    await addWorkflowEvent(
      client,
      current.tenant_id,
      id,
      actorId,
      "status_changed",
      current.status,
      nextStatus,
      body.note || null
    )

    await client.query("commit")

    return NextResponse.json({
      ok: true,
      message: `Content status changed to ${nextStatus}`,
      data: updated,
    })
  } catch (err: any) {
    await client.query("rollback")
    return jsonError(err.message || "Failed to change status", 500)
  } finally {
    client.release()
  }
}
