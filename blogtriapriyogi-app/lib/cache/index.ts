type CacheValue = {
  value: unknown
  expiresAt: number | null
  tags: string[]
}

type GlobalCache = typeof globalThis & {
  __tri_memory_cache?: Map<string, CacheValue>
}

const globalCache = globalThis as GlobalCache

function store() {
  if (!globalCache.__tri_memory_cache) {
    globalCache.__tri_memory_cache = new Map()
  }

  return globalCache.__tri_memory_cache
}

export function cacheSet(
  key: string,
  value: unknown,
  options: { ttlSeconds?: number; tags?: string[] } = {}
) {
  const expiresAt = options.ttlSeconds
    ? Date.now() + options.ttlSeconds * 1000
    : null

  store().set(key, {
    value,
    expiresAt,
    tags: options.tags || [],
  })
}

export function cacheGet<T = unknown>(key: string): T | null {
  const item = store().get(key)

  if (!item) return null

  if (item.expiresAt && item.expiresAt < Date.now()) {
    store().delete(key)
    return null
  }

  return item.value as T
}

export function cacheDelete(key: string) {
  store().delete(key)
}

export function cacheDeleteByTag(tag: string) {
  for (const [key, item] of store().entries()) {
    if (item.tags.includes(tag)) {
      store().delete(key)
    }
  }
}

export function cacheHealth() {
  return {
    ok: true,
    driver: process.env.REDIS_URL ? "redis-ready-placeholder" : "memory",
    keys: store().size,
  }
}
