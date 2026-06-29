const fs = require("fs")
const path = require("path")
const { Pool } = require("pg")

function loadEnv(file) {
  const p = path.join(process.cwd(), file)
  if (!fs.existsSync(p)) return

  const raw = fs.readFileSync(p, "utf8")
  for (const line of raw.split(/\r?\n/)) {
    const clean = line.trim()
    if (!clean || clean.startsWith("#")) continue

    const i = clean.indexOf("=")
    if (i === -1) continue

    const key = clean.slice(0, i).trim()
    let value = clean.slice(i + 1).trim()
    value = value.replace(/^['"]|['"]$/g, "")

    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv(".env.local")

const requiredTables = [
  "tenants",
  "tenant_limits",
  "profiles",
  "posts",
  "media_assets",
  "domains",
  "analytics_events",
  "templates",
  "template_pages",
  "payments",
  "user_roles",
  "cache_entries",
  "job_queues",
  "jobs",
  "storage_assets",
  "storage_asset_variants"
]

const tenantTables = requiredTables.filter(t => t !== "tenants")

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditemukan di .env.local")
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  })

  try {
    const tables = await pool.query(
      `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      and table_name = any($1)
      order by table_name
      `,
      [requiredTables]
    )

    const existingTables = tables.rows.map(r => r.table_name)
    const missingTables = requiredTables.filter(t => !existingTables.includes(t))

    const tenantCols = await pool.query(
      `
      select table_name
      from information_schema.columns
      where table_schema = 'public'
      and column_name = 'tenant_id'
      and table_name = any($1)
      order by table_name
      `,
      [tenantTables]
    )

    const tenantReady = tenantCols.rows.map(r => r.table_name)
    const missingTenantId = tenantTables.filter(t => !tenantReady.includes(t))

    const indexes = await pool.query(
      `
      select tablename, count(*)::int as index_count
      from pg_indexes
      where schemaname = 'public'
      and tablename = any($1)
      group by tablename
      order by tablename
      `,
      [requiredTables]
    )

    const partition = await pool.query(
      `
      select
        coalesce(
          (select relkind from pg_class where oid = to_regclass('public.analytics_events')),
          'missing'
        ) as analytics_relkind,
        (
          select count(*)::int
          from pg_inherits
          where inhparent = to_regclass('public.analytics_events')
        ) as partition_count
      `
    )

    const result = {
      ok: missingTables.length === 0 && missingTenantId.length === 0,
      database: "connected",
      tables: {
        required_count: requiredTables.length,
        existing_count: existingTables.length,
        missing: missingTables
      },
      multi_tenant: {
        checked_tables: tenantTables.length,
        with_tenant_id: tenantReady.length,
        missing_tenant_id: missingTenantId
      },
      indexes: indexes.rows,
      analytics_partition: {
        relkind: partition.rows[0].analytics_relkind,
        partition_count: partition.rows[0].partition_count,
        note: "relkind p artinya analytics_events adalah partitioned table"
      }
    }

    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error(JSON.stringify({
      ok: false,
      error: err.message
    }, null, 2))
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
