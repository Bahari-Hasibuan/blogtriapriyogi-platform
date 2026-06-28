export const registry = {
  systems: [] as any[],

  add(system: any) {
    this.systems.push(system)
  },

  list() {
    return this.systems
  }
}
