export const tenantContext = {
  currentTenant: null as string | null as string | null,

  setTenant(id: string) {
    this.currentTenant = id
  },

  getTenant() {
    return this.currentTenant
  }
}
