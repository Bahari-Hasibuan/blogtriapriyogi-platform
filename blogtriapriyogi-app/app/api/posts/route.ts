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
        error: 'DATABASE_URL belum tersedia',
        count: 0,
        data: [],
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
      limit 50
    `)

    return NextResponse.json({
      ok: true,
      database: 'connected',
      table: 'posts',
      count: result.rowCount,
      data: result.rows,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error),
        count: 0,
        data: [],
      },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => null)
  }
}
