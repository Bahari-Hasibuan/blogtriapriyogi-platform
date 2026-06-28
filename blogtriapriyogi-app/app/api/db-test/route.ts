import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export async function GET() {
  try {
    const rows = await query('select now() as waktu_server')
    return NextResponse.json({
      ok: true,
      database: 'connected',
      data: rows[0],
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
