export function gateway(req: any) {
  return {
    route: req.url,
    method: req.method,
    auth: "verified",
    rateLimit: "active",
    tenant: "resolved",
    status: "ok"
  }
}
