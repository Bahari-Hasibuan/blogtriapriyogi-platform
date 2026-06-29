import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DB_URL

  if (!url) {
    throw new Error("DATABASE_URL belum tersedia")
  }

  return url
}

function getPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum tersedia")
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140)
}

function getKind(mime: string) {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  if (mime.includes("pdf")) return "document"
  return "file"
}

async function getDefaultTenantId(pool: Pool) {
  const result = await pool.query(
    `
    select id
    from public.tenants
    order by created_at asc
    limit 1
    `
  )

  const tenant = result.rows[0]

  if (!tenant) {
    throw new Error("Tenant belum ada. Buat tenant default dulu.")
  }

  return tenant.id as string
}

async function ensureBucket() {
  const supabase = getSupabaseAdmin()
  const bucket = "media"

  const found = await supabase.storage.getBucket(bucket)

  if (found.error) {
    const created = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 26214400,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "application/pdf",
      ],
    })

    if (created.error && !created.error.message.toLowerCase().includes("already")) {
      throw created.error
    }
  }

  return bucket
}

export async function GET(req: NextRequest) {
  const pool = getPool()

  try {
    const { searchParams } = new URL(req.url)
    const kind = searchParams.get("kind")
    const folder = searchParams.get("folder")

    const tenantId = await getDefaultTenantId(pool)

    const values: any[] = [tenantId]
    let where = "where tenant_id = $1 and deleted_at is null"

    if (kind) {
      values.push(kind)
      where += ` and kind = $${values.length}`
    }

    if (folder) {
      values.push(folder)
      where += ` and folder = $${values.length}`
    }

    const result = await pool.query(
      `
      select
        id,
        bucket,
        path,
        url,
        filename,
        original_filename,
        mime_type,
        size_bytes,
        kind,
        alt_text,
        caption,
        folder,
        metadata,
        created_at,
        updated_at
      from public.media_assets
      ${where}
      order by created_at desc
      limit 200
      `,
      values
    )

    return NextResponse.json({
      ok: true,
      count: result.rowCount,
      data: result.rows,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || String(error),
      },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()

  try {
    const form = await req.formData()
    const file = form.get("file")
    const altText = String(form.get("alt_text") || "")
    const caption = String(form.get("caption") || "")
    const folder = String(form.get("folder") || "root")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "File tidak ditemukan",
        },
        { status: 400 }
      )
    }

    const tenantId = await getDefaultTenantId(pool)
    const bucket = await ensureBucket()
    const supabase = getSupabaseAdmin()

    const originalName = file.name || "upload"
    const filename = `${Date.now()}-${cleanFileName(originalName)}`
    const path = `${tenantId}/${folder}/${filename}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || "application/octet-stream"

    const upload = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    })

    if (upload.error) {
      throw upload.error
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

    const inserted = await pool.query(
      `
      insert into public.media_assets (
        tenant_id,
        bucket,
        path,
        url,
        filename,
        original_filename,
        mime_type,
        size_bytes,
        kind,
        alt_text,
        caption,
        folder,
        metadata
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      returning *
      `,
      [
        tenantId,
        bucket,
        path,
        publicUrl,
        filename,
        originalName,
        mimeType,
        file.size,
        getKind(mimeType),
        altText,
        caption,
        folder,
        {},
      ]
    )

    return NextResponse.json({
      ok: true,
      message: "Media uploaded",
      data: inserted.rows[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || String(error),
      },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}
