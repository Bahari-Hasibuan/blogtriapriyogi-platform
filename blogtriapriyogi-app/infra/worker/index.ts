export async function worker(job: any) {
  return {
    status: "processed",
    jobId: job.id,
    processedAt: new Date()
  }
}
