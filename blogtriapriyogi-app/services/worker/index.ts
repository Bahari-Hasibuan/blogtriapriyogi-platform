import { claimNextJob, failJob, finishJob } from "../../lib/queue"

const workerId = `worker-${process.pid}-${Date.now()}`
const queueName = process.env.WORKER_QUEUE || "default"

async function processJob(job: any) {
  console.log("PROCESSING_JOB", job.type, job.id)

  if (job.type === "analytics.rollup") {
    return { handled: true, type: job.type }
  }

  if (job.type === "seo.audit") {
    return { handled: true, type: job.type }
  }

  if (job.type === "media.optimize") {
    return { handled: true, type: job.type }
  }

  if (job.type === "ai.generate") {
    return { handled: true, type: job.type }
  }

  return { handled: false, type: job.type }
}

async function tick() {
  const job = await claimNextJob(workerId, queueName)

  if (!job) {
    return
  }

  try {
    const result = await processJob(job)
    await finishJob(job.id, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await failJob(job.id, message)
  }
}

async function main() {
  console.log("Worker started", { workerId, queueName })

  while (true) {
    await tick()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
