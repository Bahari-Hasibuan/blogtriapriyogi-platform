const fs = require("fs")

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

const keys = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET"
]

console.log("Folder kerja:", process.cwd())
console.log("File .env.local:", fs.existsSync(".env.local") ? "ADA" : "TIDAK ADA")
console.log("File .env:", fs.existsSync(".env") ? "ADA" : "TIDAK ADA")
console.log("")

for (const key of keys) {
  const value = process.env[key]
  console.log(`${key}: ${value ? "ADA, panjang " + value.length : "BELUM ADA"}`)
}

const db =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING

console.log("")
console.log("Database URL terbaca:", db ? "YA" : "TIDAK")
