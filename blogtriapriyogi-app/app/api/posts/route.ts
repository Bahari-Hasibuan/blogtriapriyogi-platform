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

    const result = await pool.query(`
      select
        id,
        title,
        slug,
        excerpt,
        status,
        published_at,
        created_at
      from posts
      order by created_at desc
      limit 20
    `)

    await pool.end()

    return NextResponse.json({
      ok: true,
      count: result.rowCount,
      data: result.rows,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
