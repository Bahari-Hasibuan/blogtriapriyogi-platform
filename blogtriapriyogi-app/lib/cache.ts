import { dbRead, dbWrite } from "./db"

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const result = await dbRead(
    `
    select value
    from cache_entries
    where key = $1
      and (expires_at is null or expires_at > now())
    limit 1
    `,
    [key]
  )

  if (!result.rows[0]) return null
  return result.rows[0].value as T
}

export async function setCache(input: {
  key: string
  value: unknown
  tenantId?: string | null
  namespace?: string
  tags?: string[]
  ttlSeconds?: number
}) {
  const expiresAt = input.ttlSeconds
    ? new Date(Date.now() + input.ttlSeconds * 1000).toISOString()
    : null

  await dbWrite(
    `
    insert into cache_entries
      (key, tenant_id, namespace, value, tags, expires_at)
    values
      ($1, $2, $3, $4::jsonb, $5, $6)
    on conflict (key) do update
    set
      tenant_id = excluded.tenant_id,
      namespace = excluded.namespace,
      value = excluded.value,
      tags = excluded.tags,
      expires_at = excluded.expires_at,
      updated_at = now()
    `,
    [
      input.key,
      input.tenantId || null,
      input.namespace || "global",
      JSON.stringify(input.value),
      input.tags || [],
      expiresAt,
    ]
  )
}

export async function deleteCache(key: string) {
  await dbWrite("delete from cache_entries where key = $1", [key])
}

export async function purgeCacheByTag(tag: string) {
  await dbWrite("delete from cache_entries where $1 = any(tags)", [tag])
}
