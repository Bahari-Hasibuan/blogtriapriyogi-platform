const fs = require('fs')
const { Pool } = require('pg')

function getDatabaseUrl() {
  const env = fs.readFileSync('.env.local', 'utf8')
  const line = env.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='))

  if (!line) {
    throw new Error('DATABASE_URL tidak ditemukan di .env.local')
  }

  return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '')
}

async function main() {
  const databaseUrl = getDatabaseUrl()
  const sql = fs.readFileSync('infra/schema.sql', 'utf8')

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await pool.query(sql)
  await pool.end()

  console.log('Schema database berhasil dibuat atau diperbarui.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
