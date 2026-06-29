import { Pool, QueryResultRow } from "pg"

const databaseUrl = process.env.DATABASE_URL
const readDatabaseUrl = process.env.READ_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required")
}

const writePool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.DB_WRITE_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
})

const readPool = new Pool({
  connectionString: readDatabaseUrl,
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.DB_READ_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
})

export async function dbRead<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return readPool.query<T>(text, params)
}

export async function dbWrite<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return writePool.query<T>(text, params)
}

export async function dbHealth() {
  const write = await dbWrite("select now() as waktu, current_database() as database, 'write' as role")
  const read = await dbRead("select now() as waktu, current_database() as database, 'read' as role")

  return {
    ok: true,
    write: write.rows[0],
    read: read.rows[0],
    readReplicaEnabled: Boolean(process.env.READ_DATABASE_URL),
  }
}
