import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __tri_pg_pool: Pool | undefined
}

export function getPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  if (!global.__tri_pg_pool) {
    global.__tri_pg_pool = new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === "production" || connectionString.includes("supabase")
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    })
  }

  return global.__tri_pg_pool
}
