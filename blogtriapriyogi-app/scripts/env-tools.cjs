const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const { spawnSync } = require("child_process")
const readline = require("readline/promises")

const REQUIRED_KEYS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET"
]

const OPTIONAL_KEYS = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET"
]

const ALL_KEYS = [...REQUIRED_KEYS, ...OPTIONAL_KEYS]

const DB_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "SUPABASE_DB_URL"
]

const ENV_FILES = [
  ".env.local",
  ".env",
  ".env.production",
  ".env.development",
  ".env.local.backup",
  ".env.backup",
  "../.env.local",
  "../.env",
  "../.env.local.backup",
  "../.env.backup"
]

function parseEnv(text) {
  const env = {}

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith("#")) continue

    const clean = line.startsWith("export ") ? line.slice(7).trim() : line
    const eq = clean.indexOf("=")

    if (eq === -1) continue

    const key = clean.slice(0, eq).trim()
    let value = clean.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  return parseEnv(fs.readFileSync(file, "utf8"))
}

function loadAllEnvFiles() {
  const merged = {}

  for (const file of ENV_FILES) {
    if (!fs.existsSync(file)) continue

    const parsed = readEnvFile(file)

    for (const [key, value] of Object.entries(parsed)) {
      if (!merged[key] && value) {
        merged[key] = value
      }
    }
  }

  return merged
}

function readLocalEnv() {
  return readEnvFile(".env.local")
}

function quoteEnv(value) {
  return JSON.stringify(String(value ?? ""))
}

function writeEnvLocal(env) {
  const existingText = fs.existsSync(".env.local")
    ? fs.readFileSync(".env.local", "utf8")
    : ""

  const existing = parseEnv(existingText)
  const finalEnv = { ...existing, ...env }

  const keys = Object.keys(finalEnv).sort()
  const lines = [
    "# Local environment for BlogTriApriyogi",
    "# Jangan commit file ini ke GitHub.",
    ""
  ]

  for (const key of keys) {
    if (!finalEnv[key]) continue
    lines.push(`${key}=${quoteEnv(finalEnv[key])}`)
  }

  fs.writeFileSync(".env.local", lines.join("\n") + "\n")
}

function mask(value) {
  if (!value) return "BELUM ADA"
  if (value.length <= 12) return `ADA, panjang ${value.length}`
  return `ADA, ${value.slice(0, 6)}...${value.slice(-4)}, panjang ${value.length}`
}

function check() {
  const local = readLocalEnv()
  const all = loadAllEnvFiles()

  console.log("Folder kerja:", process.cwd())
  console.log("")
  console.log("Cek file:")
  for (const file of ENV_FILES) {
    console.log("-", file, fs.existsSync(file) ? "ADA" : "TIDAK ADA")
  }

  console.log("")
  console.log("Cek variable di .env.local:")
  for (const key of ALL_KEYS) {
    console.log(key + ":", mask(local[key]))
  }

  console.log("")
  console.log("Cek database URL alternatif:")
  for (const key of DB_KEYS) {
    console.log(key + ":", mask(local[key] || all[key]))
  }

  const usableDb =
    local.DATABASE_URL ||
    local.POSTGRES_URL ||
    local.POSTGRES_PRISMA_URL ||
    local.POSTGRES_URL_NON_POOLING ||
    local.SUPABASE_DB_URL ||
    all.DATABASE_URL ||
    all.POSTGRES_URL ||
    all.POSTGRES_PRISMA_URL ||
    all.POSTGRES_URL_NON_POOLING ||
    all.SUPABASE_DB_URL

  console.log("")
  console.log("Database URL terbaca:", usableDb ? "YA" : "TIDAK")

  const missing = REQUIRED_KEYS.filter((key) => !local[key])

  console.log("")
  if (missing.length) {
    console.log("Status: BELUM LENGKAP")
    console.log("Kurang:", missing.join(", "))
  } else {
    console.log("Status: LENGKAP")
  }
}

function restore() {
  const local = readLocalEnv()
  const all = loadAllEnvFiles()
  const next = { ...local }

  for (const key of ALL_KEYS) {
    if (!next[key] && all[key]) {
      next[key] = all[key]
    }
  }

  if (!next.DATABASE_URL) {
    for (const key of DB_KEYS) {
      if (all[key]) {
        next.DATABASE_URL = all[key]
        break
      }
    }
  }

  if (!next.JWT_SECRET) {
    next.JWT_SECRET = crypto.randomBytes(48).toString("hex")
  }

  writeEnvLocal(next)
  console.log(".env.local sudah dipulihkan dari backup/file env yang tersedia.")
  check()
}

async function ask() {
  const local = readLocalEnv()
  const next = { ...local }

  if (!next.JWT_SECRET) {
    next.JWT_SECRET = crypto.randomBytes(48).toString("hex")
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log("")
  console.log("Isi variable yang masih kosong.")
  console.log("Tekan Enter untuk skip variable optional.")
  console.log("")

  for (const key of REQUIRED_KEYS) {
    if (next[key]) continue

    const answer = await rl.question(`${key}: `)

    if (!answer.trim()) {
      console.log(`${key} masih kosong.`)
    } else {
      next[key] = answer.trim()
    }
  }

  for (const key of OPTIONAL_KEYS) {
    if (next[key]) continue

    const answer = await rl.question(`${key} optional: `)

    if (answer.trim()) {
      next[key] = answer.trim()
    }
  }

  rl.close()

  writeEnvLocal(next)
  console.log("")
  console.log(".env.local berhasil dibuat atau diupdate.")
  check()
}

function pushToVercel() {
  const local = readLocalEnv()

  const missing = REQUIRED_KEYS.filter((key) => !local[key])

  if (missing.length) {
    console.error("Tidak bisa push ke Vercel. Variable wajib masih kurang:")
    console.error(missing.join(", "))
    process.exit(1)
  }

  const envTargets = ["production", "preview", "development"]

  for (const key of ALL_KEYS) {
    const value = local[key]
    if (!value) continue

    for (const target of envTargets) {
      console.log(`Sync ${key} ke Vercel ${target}...`)

      spawnSync("npx", ["vercel", "env", "rm", key, target, "--yes"], {
        stdio: "ignore"
      })

      const result = spawnSync("npx", ["vercel", "env", "add", key, target], {
        input: value + "\n",
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"]
      })

      if (result.status !== 0) {
        console.error(`Gagal sync ${key} ke ${target}`)
        console.error(result.stderr || result.stdout)
        process.exit(1)
      }
    }
  }

  console.log("")
  console.log("Semua env dari .env.local sudah dikirim ke Vercel.")
}

const cmd = process.argv[2]

if (cmd === "check") {
  check()
} else if (cmd === "restore") {
  restore()
} else if (cmd === "ask") {
  ask()
} else if (cmd === "push-vercel") {
  pushToVercel()
} else {
  console.log("Perintah:")
  console.log("node scripts/env-tools.cjs check")
  console.log("node scripts/env-tools.cjs restore")
  console.log("node scripts/env-tools.cjs ask")
  console.log("node scripts/env-tools.cjs push-vercel")
}
