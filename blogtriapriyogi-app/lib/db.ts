import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL belum diisi di .env.local')
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
})

export async function query<T = any>(text: string, params: unknown[] = []) {
  const result = await pool.query(text, params)
  return result.rows as T[]
}
