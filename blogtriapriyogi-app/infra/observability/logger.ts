export const logger = {
  logs: [] as any[],

  info(msg: string) {
    this.logs.push({ level: "info", msg, time: Date.now() })
  },

  error(msg: string) {
    this.logs.push({ level: "error", msg, time: Date.now() })
  },

  trace() {
    return this.logs
  }
}
