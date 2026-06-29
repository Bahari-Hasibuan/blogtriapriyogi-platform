const fs = require("fs")
const path = require("path")
const { Pool } = require("pg")

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx === -1) continue

    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadEnv()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum ada di .env.local")
  }

  const sql = fs.readFileSync(
    path.join(process.cwd(), "infra/schema-big-platform.sql"),
    "utf8"
  )

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 20000,
  })

  try {
    await pool.query(sql)
    const result = await pool.query("select * from platform_admin_overview")
    console.log(JSON.stringify({ ok: true, schema: "applied", overview: result.rows[0] }, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2))
  process.exit(1)
})
