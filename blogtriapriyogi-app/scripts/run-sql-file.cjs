const fs = require("fs")
const { Pool } = require("pg")

function loadEnv(file) {
  if (!fs.existsSync(file)) return

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const index = trimmed.indexOf("=")
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim().replace(/^export\s+/, "")
    let value = trimmed.slice(index + 1).trim()

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

const file = process.argv[2]

if (!file) {
  console.error("Pakai: node scripts/run-sql-file.cjs <file.sql>")
  process.exit(1)
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DB_URL

if (!databaseUrl) {
  console.error("DATABASE_URL belum terbaca dari .env.local")
  process.exit(1)
}

if (!fs.existsSync(file)) {
  console.error("File SQL tidak ditemukan:", file)
  process.exit(1)
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const sql = fs.readFileSync(file, "utf8")
  await pool.query(sql)
  console.log("SQL berhasil dijalankan:", file)
}

main()
  .catch((err) => {
    console.error("SQL ERROR:", err.message)
    process.exit(1)
  })
  .finally(() => pool.end())
