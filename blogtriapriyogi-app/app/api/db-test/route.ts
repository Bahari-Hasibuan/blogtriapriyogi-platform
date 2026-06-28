import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL belum tersedia')
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 1,
      connectionTimeoutMillis: 15000,
    })

    const result = await pool.query('select now() as waktu_server')

    await pool.end()

    return NextResponse.json({
      ok: true,
      database: 'connected',
      data: result.rows[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        database: 'failed',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
