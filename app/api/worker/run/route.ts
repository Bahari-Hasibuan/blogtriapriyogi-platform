import { NextRequest, NextResponse } from "next/server"
import { claimNextJob, failJob, finishJob } from "@/lib/queue"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type WorkerJob = {
  id: string
  type: string
  payload: Record<string, unknown>
}

type WorkerResult = {
  ok: boolean
  message: string
  jobId?: string
  type?: string
  data?: Record<string, unknown>
}

function jsonOk(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    { status }
  )
}

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status }
  )
}

function safePayload(value: unknown): Record<string, unknown> {
  if (!value) return {}

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function normalizeJob(row: any): WorkerJob | null {
  if (!row || !row.id) return null

  return {
    id: String(row.id),
    type: String(row.type || row.job_type || row.name || row.queue_name || "default"),
    payload: safePayload(row.payload || row.data || {}),
  }
}

async function processJob(job: WorkerJob): Promise<WorkerResult> {
  switch (job.type) {
    case "generate-content":
    case "content.generate":
    case "ai.generate":
      return {
        ok: true,
        jobId: job.id,
        type: job.type,
        message: "Generate content job accepted.",
        data: job.payload,
      }

    case "publish-content":
    case "content.publish":
      return {
        ok: true,
        jobId: job.id,
        type: job.type,
        message: "Publish content job accepted.",
        data: job.payload,
      }

    case "sync-media":
    case "media.sync":
      return {
        ok: true,
        jobId: job.id,
        type: job.type,
        message: "Media sync job accepted.",
        data: job.payload,
      }

    default:
      return {
        ok: true,
        jobId: job.id,
        type: job.type,
        message: "Worker job acknowledged.",
        data: job.payload,
      }
  }
}

async function runWorker(req: NextRequest) {
  const url = new URL(req.url)
  const rawLimit = Number(url.searchParams.get("limit") || "1")
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 10) : 1

  const results: WorkerResult[] = []

  try {
    for (let i = 0; i < limit; i++) {
      const rawJob = await claimNextJob()
      const job = normalizeJob(rawJob)

      if (!job) break

      try {
        const result = await processJob(job)
        await finishJob(job.id, result)

        results.push(result)
      } catch (err: any) {
        const message = err?.message || "Worker job failed"
        await failJob(job.id, { message })

        results.push({
          ok: false,
          jobId: job.id,
          type: job.type,
          message,
        })
      }
    }

    return jsonOk({
      processed: results.length,
      results,
    })
  } catch (err: any) {
    return jsonError(err?.message || "Worker run failed", 500)
  }
}

export async function GET(req: NextRequest) {
  return runWorker(req)
}

export async function POST(req: NextRequest) {
  return runWorker(req)
}
