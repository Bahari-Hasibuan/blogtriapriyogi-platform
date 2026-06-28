export function gateway(req: any) {
  return {
    route: req.url,
    method: req.method,
    status: "routed",
    region: "global-edge"
  }
}
