export const tenantSystem = {
  current: null as string | null,

  set(id: string) {
    this.current = id
  },

  get() {
    return this.current
  }
}
