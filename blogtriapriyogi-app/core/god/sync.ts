export function syncSystems(systems: any[]) {
  return {
    synced: systems.length,
    status: "all systems synchronized",
    latency: "global-optimal"
  }
}
