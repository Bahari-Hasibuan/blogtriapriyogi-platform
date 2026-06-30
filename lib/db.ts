const { Pool } = require("pg")

let sharedPool: any = null

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DB_URL ||
    ""
  )
}

export function getPool() {
  if (sharedPool) return sharedPool

  const connectionString = getConnectionString()

  if (!connectionString) {
    throw new Error("DATABASE_URL belum tersedia di environment")
  }

  sharedPool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  return sharedPool
}

export async function query(text: any, params?: any[]) {
  const pool = getPool()
  return pool.query(text, params)
}

async function runDbQuery(text: any, params?: any[]) {
  const pool = getPool()
  return pool.query(text, params)
}

export const dbRead: any = Object.assign(runDbQuery, {
  query: runDbQuery,
  pool: getPool,
})

export const dbWrite: any = Object.assign(runDbQuery, {
  query: runDbQuery,
  pool: getPool,
})

export const db: any = Object.assign(runDbQuery, {
  query: runDbQuery,
  read: dbRead,
  write: dbWrite,
  pool: getPool,
})

export default db
