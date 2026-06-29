import pg, { type PoolClient, type QueryResultRow } from "pg"

const { Pool } = pg

type GlobalDb = typeof globalThis & {
  __tri_primary_pool?: pg.Pool
  __tri_replica_pool?: pg.Pool
}

const globalDb = globalThis as GlobalDb

function createPool(connectionString: string) {
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  })
}

export function primaryPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required")
  }

  if (!globalDb.__tri_primary_pool) {
    globalDb.__tri_primary_pool = createPool(process.env.DATABASE_URL)
  }

  return globalDb.__tri_primary_pool
}

export function replicaPool() {
  const replicaUrl = process.env.DATABASE_REPLICA_URL || process.env.DATABASE_URL

  if (!replicaUrl) {
    throw new Error("DATABASE_URL is required")
  }

  if (!globalDb.__tri_replica_pool) {
    globalDb.__tri_replica_pool = createPool(replicaUrl)
  }

  return globalDb.__tri_replica_pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return primaryPool().query<T>(text, params)
}

export async function queryRead<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return replicaPool().query<T>(text, params)
}

export async function withTenant<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>
) {
  const client = await primaryPool().connect()

  try {
    await client.query("select set_config($1, $2, true)", [
      "app.tenant_id",
      tenantId,
    ])

    return await fn(client)
  } finally {
    client.release()
  }
}

export async function dbHealth() {
  const primary = await query(`
    select
      now() as server_time,
      current_database() as database_name,
      current_user as database_user
  `)

  let replica = null

  try {
    const replicaResult = await queryRead(`
      select
        now() as server_time,
        current_database() as database_name,
        current_user as database_user
    `)

    replica = {
      ok: true,
      result: replicaResult.rows[0],
    }
  } catch (error) {
    replica = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return {
    ok: true,
    primary: primary.rows[0],
    replica,
  }
}
