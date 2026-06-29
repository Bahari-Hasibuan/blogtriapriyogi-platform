const fs = require("fs")
const path = require("path")
const { Pool } = require("pg")

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const text = fs.readFileSync(filePath, "utf8")

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.replace(/^\uFEFF/, "").trim()

    if (!line) continue
    if (line.startsWith("#")) continue
    if (line.startsWith("export ")) line = line.slice(7).trim()

    const eq = line.indexOf("=")
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function loadEnv() {
  const cwd = process.cwd()

  const files = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(cwd, ".env.production"),
    path.join(cwd, "../.env.local"),
    path.join(cwd, "../.env"),
  ]

  for (const file of files) {
    readEnvFile(file)
  }
}

function mask(value) {
  if (!value) return "BELUM ADA"
  return "ADA, panjang " + value.length
}

loadEnv()

const sqlFile = process.argv[2]

if (!sqlFile) {
  console.error("Pakai: node scripts/apply-sql.cjs infra/nama-file.sql")
  process.exit(1)
}

const candidates = {
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
}

console.log("Cek env database:")
for (const [key, value] of Object.entries(candidates)) {
  console.log("-", key + ":", mask(value))
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DB_URL

if (!databaseUrl) {
  console.error("")
  console.error("DATABASE URL belum terbaca.")
  console.error("Solusi cepat:")
  console.error("1. Jalankan: npx vercel env pull .env.local --environment=production")
  console.error("2. Pastikan file .env.local ada di folder blogtriapriyogi-app")
  console.error("3. Pastikan ada salah satu: DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING")
  process.exit(1)
}

if (!fs.existsSync(sqlFile)) {
  console.error("File SQL tidak ditemukan:", sqlFile)
  process.exit(1)
}

const sql = fs.readFileSync(sqlFile, "utf8")

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false },
})

async function main() {
  console.log("Menjalankan SQL:", sqlFile)
  await pool.query(sql)
  console.log("SUKSES: SQL berhasil dijalankan.")
}

main()
  .catch((err) => {
    console.error("SQL ERROR:", err.message)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
