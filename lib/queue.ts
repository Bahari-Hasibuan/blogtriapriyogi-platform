import { query } from "@/lib/db/client"

export type QueuePayload = Record<string, unknown>

export type WorkerJob = {
  id: string
  queue_name?: string
  type: string
  status?: string
  payload: QueuePayload
  result?: QueuePayload | null
  error?: string | null
  created_at?: string
  updated_at?: string
}

type AnyRow = Record<string, any>

function parsePayload(value: unknown): QueuePayload {
  if (!value) return {}

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed as QueuePayload
        : {}
    } catch {
      return {}
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as QueuePayload
  }

  return {}
}

function normalizeJob(row: AnyRow | null | undefined): WorkerJob | null {
  if (!row) return null

  return {
    ...row,
    id: String(row.id),
    queue_name: String(row.queue_name || "default"),
    type: String(row.type || row.job_type || row.name || "default"),
    status: row.status ? String(row.status) : undefined,
    payload: parsePayload(row.payload || row.data || {}),
    result: row.result || null,
    error: row.error || null,
  }
}

function resolveQueueName(
  workerIdOrQueueName?: string,
  maybeQueueName?: string
) {
  return maybeQueueName || workerIdOrQueueName || "default"
}

export async function enqueueJob(
  type: string,
  payload: QueuePayload = {},
  queueName = "default"
) {
  const result = await query(
    `
    insert into public.worker_jobs
      (queue_name, type, payload, status, created_at, updated_at)
    values
      ($1, $2, $3::jsonb, 'queued', now(), now())
    returning *
    `,
    [queueName, type, JSON.stringify(payload)]
  )

  return normalizeJob(result.rows?.[0])
}

/**
 * Kompatibel untuk 2 pola lama:
 * claimNextJob(queueName)
 * claimNextJob(workerId, queueName)
 */
export async function claimNextJob(
  workerIdOrQueueName?: string,
  maybeQueueName?: string
) {
  const queueName = resolveQueueName(workerIdOrQueueName, maybeQueueName)

  const result = await query(
    `
    update public.worker_jobs
    set
      status = 'processing',
      locked_at = now(),
      updated_at = now()
    where id = (
      select id
      from public.worker_jobs
      where
        queue_name = $1
        and status in ('queued', 'pending')
      order by created_at asc nulls last
      limit 1
      for update skip locked
    )
    returning *
    `,
    [queueName]
  )

  return normalizeJob(result.rows?.[0])
}

export async function dequeueJob(queueName = "default") {
  return claimNextJob(queueName)
}

export async function completeJob(
  id: string,
  resultPayload: QueuePayload = {}
) {
  const result = await query(
    `
    update public.worker_jobs
    set
      status = 'completed',
      result = $2::jsonb,
      finished_at = now(),
      updated_at = now()
    where id = $1
    returning *
    `,
    [id, JSON.stringify(resultPayload)]
  )

  return normalizeJob(result.rows?.[0])
}

export async function finishJob(
  id: string,
  resultPayload: QueuePayload = {}
) {
  return completeJob(id, resultPayload)
}

export async function failJob(
  id: string,
  error: unknown = "Worker job failed"
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error || {})

  const result = await query(
    `
    update public.worker_jobs
    set
      status = 'failed',
      error = $2,
      finished_at = now(),
      updated_at = now()
    where id = $1
    returning *
    `,
    [id, message]
  )

  return normalizeJob(result.rows?.[0])
}

export async function listJobs(
  queueName = "default",
  limit = 20
) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)

  const result = await query(
    `
    select *
    from public.worker_jobs
    where queue_name = $1 or $1 = 'all'
    order by created_at desc nulls last
    limit $2
    `,
    [queueName, safeLimit]
  )

  return result.rows.map(normalizeJob).filter(Boolean)
}

export default {
  enqueueJob,
  claimNextJob,
  dequeueJob,
  completeJob,
  finishJob,
  failJob,
  listJobs,
}
