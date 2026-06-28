import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        database: 'missing DATABASE_URL',
      },
      { status: 500 }
    )
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 15000,
  })

  try {
    await pool.query('select 1 as ok')

    return NextResponse.json({
      ok: true,
      database: 'connected',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        database: 'failed',
        error: error?.message || String(error),
      },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => null)
  }
}
