export function simulateEconomy(users: number) {
  return {
    users,
    revenue: users * 59000,
    growth: "exponential",
    status: "simulated economy active"
  }
}
