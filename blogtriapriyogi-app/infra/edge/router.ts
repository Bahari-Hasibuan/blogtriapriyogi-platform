export function planetRouter(req: any) {
  return {
    region: "auto-selected-global-node",
    edge: true,
    latency: "5-20ms",
    failover: "enabled"
  }
}
