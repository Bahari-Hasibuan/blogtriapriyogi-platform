import { Pool, type QueryResult, type QueryResultRow } from "pg"

type QueryParams = readonly unknown[]

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DB_URL ||
  ""

declare global {
  // eslint-disable-next-line no-var
  var __triapriyogiPgPool: Pool | undefined
}

function shouldUseSsl(url: string) {
  if (!url) return false
  if (url.includes("localhost")) return false
  if (url.includes("127.0.0.1")) return false
  return true
}

export function getPool() {
  if (!connectionString) {
    throw new Error(
      "Database URL belum tersedia. Isi DATABASE_URL, POSTGRES_URL, atau SUPABASE_DB_URL di environment."
    )
  }

  if (!globalThis.__triapriyogiPgPool) {
    globalThis.__triapriyogiPgPool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString)
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }

  return globalThis.__triapriyogiPgPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as unknown[])
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = []
): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.rows[0] ?? null
}

export async function many<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = []
): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

export const dbClient = {
  getPool,
  query,
  one,
  many,
}

export default dbClient
