export const healingSystem = {
  status: "stable",

  check(service: string) {
    return {
      service,
      status: "healthy",
      action: "none"
    }
  },

  recover(service: string) {
    return {
      service,
      action: "restart triggered",
      status: "recovering"
    }
  }
}
