import fs from "fs"
import pg from "pg"

const { Client } = pg

function loadEnv(file) {
  if (!fs.existsSync(file)) return

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const clean = line.trim()
    if (!clean || clean.startsWith("#")) continue

    const index = clean.indexOf("=")
    if (index === -1) continue

    const key = clean.slice(0, index).trim()
    let value = clean.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv(".env.local")
loadEnv(".env")

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum ada.")
  process.exit(1)
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()

  const ping = await client.query(`
    select
      now() as server_time,
      current_database() as database_name,
      current_user as database_user
  `)

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `)

  console.log(JSON.stringify({
    ok: true,
    database: "connected",
    ping: ping.rows[0],
    table_count: tables.rowCount,
    tables: tables.rows.map((row) => row.table_name),
  }, null, 2))
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
  }, null, 2))
  process.exit(1)
} finally {
  await client.end().catch(() => null)
}
