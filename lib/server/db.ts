import { Pool } from "pg"

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error("DATABASE_URL belum terbaca")
}

const globalForDb = globalThis as unknown as {
  dbPool?: Pool
}

export const pool =
  globalForDb.dbPool ||
  new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  })

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool
}

export async function query<T = any>(text: string, params?: any[]) {
  return pool.query<T>(text, params)
}
