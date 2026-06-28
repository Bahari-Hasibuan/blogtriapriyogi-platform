import { eventBus } from "../../core/events/event-bus"

export function startWorker() {
  setInterval(() => {
    const job = eventBus.flush()

    if (job) {
      console.log("PROCESSING JOB:", job.type)
    }
  }, 2000)
}
