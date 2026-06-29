import { Pool } from "pg"

declare global {
  var __triPgPool: Pool | undefined
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error("DATABASE_URL belum terbaca dari .env.local")
}

export const pool =
  globalThis.__triPgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__triPgPool = pool
}

export async function query<T = any>(text: string, params: any[] = []) {
  return pool.query<T>(text, params)
}
