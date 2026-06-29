import { NextRequest, NextResponse } from "next/server"
import { completeJob, dequeueJobs, failJob } from "@/lib/queue"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function processJob(job: {
  id: string
  type: string
  payload: Record<string, unknown>
}) {
  if (job.type === "noop") {
    return { ok: true, message: "noop done" }
  }

  if (job.type === "analytics.rollup") {
    return { ok: true, message: "analytics rollup placeholder" }
  }

  if (job.type === "seo.audit") {
    return { ok: true, message: "seo audit placeholder" }
  }

  if (job.type === "cdn.purge") {
    return { ok: true, message: "cdn purge placeholder" }
  }

  return {
    ok: true,
    message: `job type ${job.type} belum punya handler khusus`,
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    worker: "ready",
  })
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-worker-secret")

  if (process.env.WORKER_SECRET && secret !== process.env.WORKER_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized worker request",
      },
      { status: 401 }
    )
  }

  const workerId = `worker-${Date.now()}`
  const jobs = await dequeueJobs(workerId, 10)
  const results = []

  for (const job of jobs) {
    try {
      const result = await processJob(job)
      await completeJob(job.id, result)
      results.push({ id: job.id, type: job.type, ok: true, result })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await failJob(job.id, message)
      results.push({ id: job.id, type: job.type, ok: false, error: message })
    }
  }

  return NextResponse.json({
    ok: true,
    workerId,
    processed: results.length,
    results,
  })
}
