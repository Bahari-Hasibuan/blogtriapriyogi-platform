import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/server/db"
import { adminGuard, jsonError } from "@/lib/server/admin-auth"
import { addWorkflowEvent, getActorId } from "@/lib/server/content-service"

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

    const restored = await client.query(
      `
      update public.posts
      set
        status = 'draft',
        deleted_at = null,
        archived_at = null
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
      "restored",
      before.rows[0].status,
      "draft",
      "content restored"
    )

    await client.query("commit")

    return NextResponse.json({
      ok: true,
      message: "Content restored",
      data: restored.rows[0],
    })
  } catch (err: any) {
    await client.query("rollback")
    return jsonError(err.message || "Failed to restore content", 500)
  } finally {
    client.release()
  }
}
