export type BillingPlan = {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
}

export const billingPlans: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'IDR',
    features: ['Basic access'],
  },
]

export async function getBillingPlans() {
  return billingPlans
}

export async function getCurrentPlan() {
  return billingPlans[0]
}

export async function getBillingStatus() {
  return {
    active: true,
    plan: billingPlans[0],
  }
}

export async function createCheckoutSession() {
  return {
    ok: true,
    url: null,
  }
}

export async function createBillingPortalSession() {
  return {
    ok: true,
    url: null,
  }
}

export const billing = {
  plans: billingPlans,
  getBillingPlans,
  getCurrentPlan,
  getBillingStatus,
  createCheckoutSession,
  createBillingPortalSession,
}

export default billing
