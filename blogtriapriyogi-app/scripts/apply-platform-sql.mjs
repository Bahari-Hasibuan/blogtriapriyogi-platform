import fs from "fs"
import path from "path"
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

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv(".env.local")
loadEnv(".env")

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("DATABASE_URL belum ada.")
  process.exit(1)
}

const dir = path.join(process.cwd(), "infra", "sql")
const files = fs
  .readdirSync(dir)
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort()

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log(`Menjalankan ${files.length} file SQL...`)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const sql = fs.readFileSync(fullPath, "utf8")

    console.log(`\n▶ ${file}`)
    await client.query(sql)
    console.log(`✓ selesai`)
  }

  const result = await client.query("select * from platform_admin_overview")
  console.log("\nOverview:")
  console.log(JSON.stringify(result.rows[0], null, 2))
} catch (error) {
  console.error("\nSQL gagal:")
  console.error(error.message)
  process.exit(1)
} finally {
  await client.end().catch(() => null)
}
