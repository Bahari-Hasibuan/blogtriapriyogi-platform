export const telemetry = {
  metrics: [] as any[],

  log(event: string) {
    this.metrics.push({
      event,
      time: Date.now()
    })
  }
}
