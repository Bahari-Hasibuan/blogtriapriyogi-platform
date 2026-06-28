class Cache {
  private store = new Map()

  set(key: string, value: any) {
    this.store.set(key, value)
  }

  get(key: string) {
    return this.store.get(key)
  }
}

export const cache = new Cache()
