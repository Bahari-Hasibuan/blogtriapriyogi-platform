const fs = require("fs")

function readEnv(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const s = line.trim()
    if (!s || s.startsWith("#")) continue
    const i = s.indexOf("=")
    if (i === -1) continue
    const key = s.slice(0, i).trim()
    let val = s.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const env = readEnv(".env.local")

const keys = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "VERCEL_OIDC_TOKEN",
]

console.log("File .env.local:", fs.existsSync(".env.local") ? "ADA" : "TIDAK ADA")
console.log("")

for (const key of keys) {
  const val = env[key]
  if (!val) {
    console.log(`${key}: BELUM ADA`)
  } else {
    console.log(`${key}: ADA, panjang ${val.length}`)
  }
}

const db =
  env.DATABASE_URL ||
  env.POSTGRES_URL ||
  env.POSTGRES_PRISMA_URL ||
  env.POSTGRES_URL_NON_POOLING

console.log("")
console.log("Database URL terbaca:", db ? "YA" : "TIDAK")
