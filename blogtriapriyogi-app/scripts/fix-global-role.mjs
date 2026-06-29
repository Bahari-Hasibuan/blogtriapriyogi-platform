import pg from "pg"
import fs from "fs"

const { Client } = pg

function loadEnv(path) {
  if (!fs.existsSync(path)) return
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/)
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue
    const i = line.indexOf("=")
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    val = val.replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv(".env.local")
loadEnv(".env")

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum ada")
  process.exit(1)
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()

  await client.query(`
    create extension if not exists pgcrypto;
  `)

  await client.query(`
    create table if not exists public.profiles (
      id uuid primary key default gen_random_uuid(),
      email text,
      full_name text,
      avatar_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `)

  await client.query(`
    alter table public.profiles
    add column if not exists global_role text not null default 'user';
  `)

  await client.query(`
    alter table public.profiles
    add column if not exists tenant_id uuid;
  `)

  await client.query(`
    alter table public.profiles
    add column if not exists status text not null default 'active';
  `)

  await client.query(`
    create index if not exists profiles_global_role_idx
    on public.profiles(global_role);
  `)

  const res = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
    order by ordinal_position;
  `)

  console.log(JSON.stringify({
    ok: true,
    fixed: "profiles.global_role",
    columns: res.rows.map(r => r.column_name)
  }, null, 2))
} catch (err) {
  console.error(JSON.stringify({
    ok: false,
    error: err.message
  }, null, 2))
  process.exit(1)
} finally {
  await client.end().catch(() => null)
}
