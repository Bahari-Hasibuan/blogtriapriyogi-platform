class MemoryCache {
  private store = new Map()

  set(key: string, value: any) {
    this.store.set(key, value)
  }

  get(key: string) {
    return this.store.get(key)
  }

  delete(key: string) {
    this.store.delete(key)
  }
}

export const cache = new MemoryCache()
