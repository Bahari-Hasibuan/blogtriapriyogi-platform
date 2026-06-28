type Job = {
  id: string
  type: string
  payload: any
}

class Queue {
  private jobs: Job[] = []

  add(job: Job) {
    this.jobs.push(job)
  }

  process() {
    return this.jobs.shift()
  }
}

export const queue = new Queue()
