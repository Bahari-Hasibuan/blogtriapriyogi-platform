class Queue {
  private jobs: any[] = []

  add(job: any) {
    this.jobs.push(job)
  }

  process() {
    return this.jobs.shift()
  }
}

export const queue = new Queue()
