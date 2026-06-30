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
    const nextStatus = normalizeStatus(body.status || body.action)

    const updates = [
      "status = $1",
      "updated_at = now()",
    ]

    if (nextStatus === "published") {
      updates.push("published_at = coalesce(published_at, now())")
      updates.push("archived_at = null")
      updates.push("deleted_at = null")
    }

    if (nextStatus === "draft") {
      updates.push("archived_at = null")
      updates.push("deleted_at = null")
    }

    if (nextStatus === "archived") {
      updates.push("archived_at = now()")
    }

    const result = await client.query(
      `
      update public.posts
      set ${updates.join(", ")}
      where id = $2
        and tenant_id = $3
        and deleted_at is null
      returning *
      `,
      [nextStatus, id, tenantId]
    )

    const post = result.rows?.[0]

    if (!post) {
      return jsonError("Content not found", 404)
    }

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
          id,
          `status:${nextStatus}`,
          JSON.stringify({
            status: nextStatus,
            source: "admin-content-status-route",
          }),
        ]
      )
    } catch {
      // audit log opsional
    }

    return jsonOk({
      message: "Content status updated",
      data: post,
    })
  } catch (err: any) {
    return jsonError(err?.message || "Failed to update content status", 500)
  } finally {
    client.release()
  }
}
