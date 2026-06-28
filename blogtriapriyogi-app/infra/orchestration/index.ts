export class Orchestrator {
  private services: any[] = []

  register(service: any) {
    this.services.push(service)
  }

  list() {
    return this.services
  }

  health() {
    return "all systems nominal"
  }
}
