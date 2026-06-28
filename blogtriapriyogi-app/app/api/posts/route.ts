import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const rows = await query(`
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

    return NextResponse.json({
      ok: true,
      data: rows,
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
