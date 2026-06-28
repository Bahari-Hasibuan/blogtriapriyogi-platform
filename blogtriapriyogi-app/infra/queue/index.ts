class Queue {
  private jobs: any[] = []

  add(job: any) {
    this.jobs.push({
      ...job,
      createdAt: Date.now()
    })
  }

  process() {
    return this.jobs.shift()
  }

  size() {
    return this.jobs.length
  }
}

export const queue = new Queue()
