import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

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
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
}

function getKind(mime: string) {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  if (mime.includes("pdf")) return "document"
  return "file"
}

function canConvertToWebp(mime: string) {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mime)
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
    const originalMime = file.type || "application/octet-stream"
    const originalBuffer = Buffer.from(await file.arrayBuffer())

    let finalBuffer = originalBuffer
    let finalMime = originalMime
    let finalFilename = `${Date.now()}-${cleanFileName(originalName)}`

    if (canConvertToWebp(originalMime)) {
      finalBuffer = await sharp(originalBuffer)
        .rotate()
        .resize({
          width: 2400,
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
          effort: 4,
        })
        .toBuffer()

      finalMime = "image/webp"
      finalFilename = `${finalFilename}.webp`
    } else {
      const ext = originalName.includes(".")
        ? originalName.split(".").pop()
        : "file"

      finalFilename = `${finalFilename}.${ext}`
    }

    const path = `${tenantId}/${folder}/${finalFilename}`

    const upload = await supabase.storage.from(bucket).upload(path, finalBuffer, {
      contentType: finalMime,
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
        finalFilename,
        originalName,
        finalMime,
        finalBuffer.length,
        getKind(finalMime),
        altText,
        caption,
        folder,
        {
          original_mime_type: originalMime,
          original_size_bytes: file.size,
          converted_to_webp: canConvertToWebp(originalMime),
        },
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
