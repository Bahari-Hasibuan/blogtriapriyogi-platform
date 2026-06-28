export type Tenant = {
  id: string
  name: string
  plan: "free" | "pro" | "business"
  createdAt: Date
}

export const getTenant = (id: string): Tenant => {
  return {
    id,
    name: "Default Tenant",
    plan: "free",
    createdAt: new Date()
  }
}
