export async function worker(job: any) {
  return {
    jobId: job.id,
    status: "completed",
    processedAt: Date.now()
  }
}
