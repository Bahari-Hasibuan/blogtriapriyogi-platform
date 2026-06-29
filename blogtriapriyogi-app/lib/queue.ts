import { dbRead, dbWrite } from "./db"

export async function enqueueJob(input: {
  tenantId?: string | null
  queueName?: string
  type: string
  payload?: unknown
  priority?: number
  runAfter?: string
  maxAttempts?: number
}) {
  const result = await dbWrite(
    `
    insert into jobs
      (tenant_id, queue_name, type, payload, priority, run_after, max_attempts)
    values
      ($1, $2, $3, $4::jsonb, $5, $6, $7)
    returning *
    `,
    [
      input.tenantId || null,
      input.queueName || "default",
      input.type,
      JSON.stringify(input.payload || {}),
      input.priority || 100,
      input.runAfter || new Date().toISOString(),
      input.maxAttempts || 3,
    ]
  )

  return result.rows[0]
}

export async function claimNextJob(workerId: string, queueName = "default") {
  const result = await dbWrite(
    `
    update jobs
    set
      status = 'running',
      locked_at = now(),
      locked_by = $1,
      started_at = now(),
      attempts = attempts + 1,
      updated_at = now()
    where id = (
      select id
      from jobs
      where queue_name = $2
        and status = 'pending'
        and run_after <= now()
      order by priority asc, created_at asc
      for update skip locked
      limit 1
    )
    returning *
    `,
    [workerId, queueName]
  )

  return result.rows[0] || null
}

export async function finishJob(jobId: string, resultData: unknown = {}) {
  await dbWrite(
    `
    update jobs
    set
      status = 'success',
      finished_at = now(),
      result = $2::jsonb,
      updated_at = now()
    where id = $1
    `,
    [jobId, JSON.stringify(resultData)]
  )
}

export async function failJob(jobId: string, errorMessage: string) {
  await dbWrite(
    `
    update jobs
    set
      status = case
        when attempts >= max_attempts then 'failed'
        else 'pending'
      end,
      error_message = $2,
      run_after = now() + interval '60 seconds',
      updated_at = now()
    where id = $1
    `,
    [jobId, errorMessage]
  )
}

export async function getQueueStats() {
  const result = await dbRead(
    `
    select
      queue_name,
      status,
      count(*)::int as count
    from jobs
    group by queue_name, status
    order by queue_name, status
    `
  )

  return result.rows
}
