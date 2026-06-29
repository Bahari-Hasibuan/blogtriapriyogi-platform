import { query } from "@/lib/db/client"

export type WorkerJob = {
  id: string
  tenant_id: string | null
  queue: string
  type: string
  payload: Record<string, unknown>
  status: string
  priority: number
  attempts: number
  max_attempts: number
}

export async function enqueueJob(input: {
  tenantId?: string | null
  type: string
  payload?: Record<string, unknown>
  queue?: string
  priority?: number
  runAt?: string
}) {
  const result = await query<{ id: string }>(
    `
    select enqueue_worker_job($1, $2, $3::jsonb, $4, $5, coalesce($6::timestamptz, now())) as id
    `,
    [
      input.tenantId || null,
      input.type,
      JSON.stringify(input.payload || {}),
      input.queue || "default",
      input.priority || 0,
      input.runAt || null,
    ]
  )

  return result.rows[0]
}

export async function dequeueJobs(workerId: string, limit = 5) {
  const result = await query<WorkerJob>(
    `
    with picked as (
      select id
      from worker_jobs
      where status in ('queued', 'retry')
        and run_at <= now()
        and (locked_at is null or locked_at < now() - interval '5 minutes')
      order by priority desc, run_at asc, created_at asc
      limit $2
      for update skip locked
    )
    update worker_jobs
    set
      status = 'running',
      locked_by = $1,
      locked_at = now(),
      attempts = attempts + 1,
      updated_at = now()
    from picked
    where worker_jobs.id = picked.id
    returning worker_jobs.*
    `,
    [workerId, limit]
  )

  return result.rows
}

export async function completeJob(id: string, resultData: unknown = {}) {
  await query(
    `
    update worker_jobs
    set
      status = 'completed',
      result = $2::jsonb,
      locked_by = null,
      locked_at = null,
      updated_at = now()
    where id = $1
    `,
    [id, JSON.stringify(resultData)]
  )
}

export async function failJob(id: string, errorMessage: string) {
  await query(
    `
    update worker_jobs
    set
      status = case
        when attempts >= max_attempts then 'failed'
        else 'retry'
      end,
      error_message = $2,
      locked_by = null,
      locked_at = null,
      run_at = now() + interval '1 minute',
      updated_at = now()
    where id = $1
    `,
    [id, errorMessage]
  )
}

export async function queueStats() {
  const result = await query<{
    status: string
    count: string
  }>(
    `
    select status, count(*)::text as count
    from worker_jobs
    group by status
    order by status
    `
  )

  return result.rows
}
