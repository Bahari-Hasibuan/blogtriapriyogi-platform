export const plans = {
  free: 0,
  pro: 59000,
  enterprise: 149000
}

export function getPlanPrice(plan: keyof typeof plans) {
  return plans[plan]
}
