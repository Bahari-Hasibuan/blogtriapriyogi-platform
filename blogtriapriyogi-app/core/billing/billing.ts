export type SubscriptionPlan = "free" | "pro" | "business"

export const pricing = {
  free: 0,
  pro: 59000,
  business: 149000
}

export function getPlanPrice(plan: SubscriptionPlan) {
  return pricing[plan]
}

export function canAccessFeature(plan: SubscriptionPlan, feature: string) {
  if (plan === "business") return true
  if (plan === "pro" && feature !== "enterprise_api") return true
  return plan === "free" && feature === "basic"
}
