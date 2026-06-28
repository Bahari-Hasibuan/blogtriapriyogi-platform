const fs = require("fs")
const path = require("path")
const { Pool } = require("pg")

function loadEnv(file) {
  const envPath = path.join(process.cwd(), file)
  if (!fs.existsSync(envPath)) return

  const raw = fs.readFileSync(envPath, "utf8")

  for (const line of raw.split(/\r?\n/)) {
    const clean = line.trim()
    if (!clean || clean.startsWith("#")) continue

    const index = clean.indexOf("=")
    if (index === -1) continue

    const key = clean.slice(0, index).trim()
    let value = clean.slice(index + 1).trim()

    value = value.replace(/^['"]|['"]$/g, "")

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv(".env.local")

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditemukan di .env.local")
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await pool.query(`
      alter table if exists public.tenants
        add column if not exists plan_code text not null default 'free';

      alter table if exists public.tenants
        add column if not exists plan_status text not null default 'active';

      alter table if exists public.tenants
        add column if not exists billing_status text not null default 'free';

      alter table if exists public.tenants
        add column if not exists trial_ends_at timestamptz;

      alter table if exists public.tenants
        add column if not exists subscription_ends_at timestamptz;

      create index if not exists tenants_plan_code_idx
        on public.tenants(plan_code);

      create index if not exists tenants_plan_status_idx
        on public.tenants(plan_status);

      create index if not exists tenants_billing_status_idx
        on public.tenants(billing_status);
    `)

    console.log(JSON.stringify({
      ok: true,
      fixed: "tenant plan billing columns added"
    }, null, 2))
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message
    }, null, 2))
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
