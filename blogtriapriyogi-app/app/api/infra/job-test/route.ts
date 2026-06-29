import { NextResponse } from "next/server"
import { dbWrite } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const result = await dbWrite(
      `
      insert into jobs
        (queue_name, type, payload, priority)
      values
        ($1, $2, $3::jsonb, $4)
      returning id, queue_name, type, status, priority, created_at
      `,
      [
        "default",
        "seo.audit",
        JSON.stringify({
          source: "manual-test",
          createdFrom: "/api/infra/job-test",
        }),
        10,
      ]
    )

    return NextResponse.json({
      ok: true,
      job: result.rows[0],
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
