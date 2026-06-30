import { query } from "@/lib/server/db"

type Data = Record<string, any>

export function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function getDefaultTenant() {
  const found = await query(
    `select id, slug, name from public.tenants where slug = 'default' limit 1`
  )

  if (found.rows[0]) return found.rows[0]

  const created = await query(
    `
    insert into public.tenants (name, slug, plan_code, plan_status)
    values ('Default Workspace', 'default', 'free', 'active')
    returning id, slug, name
    `
  )

  return created.rows[0]
}

export async function listContent() {
  const tenant = await getDefaultTenant()

  const result = await query(
    `
    select
      id,
      tenant_id,
      content_type,
      title,
      slug,
      excerpt,
      status,
      visibility,
      published_at,
      archived_at,
      deleted_at,
      created_at,
      updated_at
    from public.posts
    where tenant_id = $1
    and deleted_at is null
    order by updated_at desc
    limit 100
    `,
    [tenant.id]
  )

  return result.rows
}

export async function createContent(body: Data) {
  const tenant = await getDefaultTenant()

  const title = body.title || "Untitled"
  const slug = slugify(body.slug || title)
  const content = body.content || ""
  const status = body.status || "draft"
  const contentType = body.content_type || "post"

  const result = await query(
    `
    insert into public.posts
    (
      tenant_id,
      content_type,
      title,
      slug,
      excerpt,
      content,
      status,
      visibility,
      published_at
    )
    values
    (
      $1, $2, $3, $4, $5, $6, $7, 'public',
      case when $7 = 'published' then now() else null end
    )
    returning *
    `,
    [
      tenant.id,
      contentType,
      title,
      slug,
      body.excerpt || "",
      content,
      status,
    ]
  )

  return result.rows[0]
}

export async function getContent(id: string) {
  const result = await query(
    `select * from public.posts where id = $1 limit 1`,
    [id]
  )

  return result.rows[0] || null
}

export async function updateContent(id: string, body: Data) {
  const current = await getContent(id)
  if (!current) return null

  const title = body.title ?? current.title
  const slug = body.slug ? slugify(body.slug) : current.slug
  const excerpt = body.excerpt ?? current.excerpt
  const content = body.content ?? current.content
  const status = body.status ?? current.status
  const contentType = body.content_type ?? current.content_type

  const result = await query(
    `
    update public.posts
    set
      content_type = $2,
      title = $3,
      slug = $4,
      excerpt = $5,
      content = $6,
      status = $7,
      published_at = case
        when $7 = 'published' and published_at is null then now()
        else published_at
      end,
      archived_at = case
        when $7 = 'archived' then now()
        when $7 = 'draft' then null
        else archived_at
      end,
      updated_at = now()
    where id = $1
    returning *
    `,
    [id, contentType, title, slug, excerpt, content, status]
  )

  return result.rows[0]
}

export async function actionContent(id: string, action: string) {
  if (action === "publish") {
    return updateContent(id, { status: "published" })
  }

  if (action === "draft") {
    return updateContent(id, { status: "draft" })
  }

  if (action === "archive") {
    return updateContent(id, { status: "archived" })
  }

  if (action === "restore") {
    const result = await query(
      `
      update public.posts
      set deleted_at = null,
          archived_at = null,
          status = 'draft',
          updated_at = now()
      where id = $1
      returning *
      `,
      [id]
    )

    return result.rows[0]
  }

  if (action === "delete") {
    const result = await query(
      `
      update public.posts
      set deleted_at = now(),
          updated_at = now()
      where id = $1
      returning *
      `,
      [id]
    )

    return result.rows[0]
  }

  throw new Error("Action tidak dikenal")
}



/**
 * Ambil actor/user dari request.
 * Dipakai oleh API admin untuk audit log dan workflow.
 */
export function getActorId(req?: any): string | null {
  try {
    if (!req || !req.headers) return null

    const headerGet =
      typeof req.headers.get === "function"
        ? (name: string) => req.headers.get(name)
        : (name: string) => req.headers[name]

    return (
      headerGet("x-user-id") ||
      headerGet("x-admin-user-id") ||
      headerGet("x-profile-id") ||
      null
    )
  } catch {
    return null
  }
}

/**
 * Catat workflow artikel/page.
 * Dibuat aman. Kalau tabel workflow belum ada, tidak membuat API gagal.
 */
export async function addWorkflowEvent(...args: any[]): Promise<void> {
  try {
    const db = args[0]

    if (!db || typeof db.query !== "function") return

    let payload: any = {}

    if (args.length >= 2 && typeof args[1] === "object") {
      payload = args[1]
    } else {
      payload = {
        tenant_id: args[1],
        post_id: args[2],
        actor_id: args[3],
        action: args[4],
        from_status: args[5],
        to_status: args[6],
        metadata: args[7] || {},
      }
    }

    const tenantId =
      payload.tenant_id ||
      payload.tenantId ||
      payload.tenant_id_uuid ||
      null

    const postId =
      payload.post_id ||
      payload.postId ||
      payload.content_id ||
      payload.contentId ||
      payload.entity_id ||
      null

    const actorId =
      payload.actor_id ||
      payload.actorId ||
      payload.profile_id ||
      null

    const action =
      payload.action ||
      payload.event ||
      "content_workflow"

    const fromStatus =
      payload.from_status ||
      payload.fromStatus ||
      payload.before ||
      null

    const toStatus =
      payload.to_status ||
      payload.toStatus ||
      payload.after ||
      null

    const metadata = {
      ...payload,
      from_status: fromStatus,
      to_status: toStatus,
    }

    await db.query(
      `
      insert into public.admin_audit_logs
        (tenant_id, profile_id, action, entity_type, entity_id_uuid, metadata)
      values
        ($1, $2, $3, 'content', $4, $5::jsonb)
      `,
      [
        tenantId,
        actorId,
        action,
        postId,
        JSON.stringify(metadata),
      ]
    )
  } catch (err) {
    console.warn("addWorkflowEvent skipped:", err)
  }
}



/**
 * Membuat payload update artikel/page.
 * Hanya field yang dikirim dari frontend yang akan diupdate.
 */
export function buildUpdateData(body: any = {}) {
  const allowed = [
    "content_type",
    "title",
    "slug",
    "excerpt",
    "content",
    "status",
    "visibility",
    "cover_image_url",
    "featured_image_url",
    "seo_title",
    "seo_description",
    "seo_keywords",
    "canonical_url",
    "schema_json",
    "language",
    "reading_time",
    "word_count",
  ]

  const data: Record<string, any> = {}

  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = body[key]
    }
  }

  if (body.meta_title !== undefined && data.seo_title === undefined) {
    data.seo_title = body.meta_title
  }

  if (body.meta_description !== undefined && data.seo_description === undefined) {
    data.seo_description = body.meta_description
  }

  if (body.cover_url !== undefined && data.cover_image_url === undefined) {
    data.cover_image_url = body.cover_url
  }

  data.updated_at = new Date().toISOString()

  return data
}

/**
 * Membuat slug unik per tenant.
 */
export async function ensureUniqueSlug(
  db: any,
  tenantId: string,
  slug: string,
  excludeId?: string | null
): Promise<string> {
  const base =
    String(slug || "untitled")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"

  let candidate = base
  let counter = 2

  while (true) {
    const params: any[] = [tenantId, candidate]
    let sql = `
      select id
      from public.posts
      where tenant_id = $1
        and slug = $2
        and deleted_at is null
      limit 1
    `

    if (excludeId) {
      params.push(excludeId)
      sql = `
        select id
        from public.posts
        where tenant_id = $1
          and slug = $2
          and id <> $3
          and deleted_at is null
        limit 1
      `
    }

    const found = await db.query(sql, params)

    if (!found.rows.length) return candidate

    candidate = `${base}-${counter}`
    counter++
  }
}

/**
 * Simpan revisi konten sebelum update.
 * Aman jika tabel post_revisions belum lengkap.
 */
export async function createRevision(
  db: any,
  postId: string,
  actorId: string | null = null
): Promise<void> {
  try {
    const current = await db.query(
      `
      select *
      from public.posts
      where id = $1
      limit 1
      `,
      [postId]
    )

    if (!current.rows.length) return

    const post = current.rows[0]

    await db.query(
      `
      insert into public.post_revisions
        (post_id, tenant_id, title, slug, excerpt, content, status, created_by, snapshot)
      values
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      `,
      [
        post.id,
        post.tenant_id,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.status,
        actorId,
        JSON.stringify(post),
      ]
    )
  } catch (err) {
    console.warn("createRevision skipped:", err)
  }
}

/**
 * Compatibility helper untuk route admin content.
 * Fungsi ini mencari tenant aktif dari header.
 * Jika tidak ada header, pakai tenant default.
 */
export async function getTenantId(...args: any[]): Promise<string> {
  const db = args.find((item) => item && typeof item.query === "function")
  const req = args.find((item) => item && item.headers)

  if (!db) {
    throw new Error("Database client/pool wajib dikirim ke getTenantId")
  }

  let slug = "default"

  try {
    const headers = req?.headers
    slug =
      headers?.get?.("x-tenant-slug") ||
      headers?.get?.("x-tenant") ||
      headers?.get?.("x-workspace") ||
      "default"
  } catch {
    slug = "default"
  }

  try {
    const bySlug = await db.query(
      `
      select id
      from public.tenants
      where slug = $1
      limit 1
      `,
      [slug]
    )

    if (bySlug.rows?.[0]?.id) {
      return bySlug.rows[0].id
    }
  } catch {
    // lanjut cari tenant pertama
  }

  const firstTenant = await db.query(
    `
    select id
    from public.tenants
    limit 1
    `
  )

  if (firstTenant.rows?.[0]?.id) {
    return firstTenant.rows[0].id
  }

  throw new Error("Tenant belum ada di database")
}


/**
 * Ambil satu konten lengkap berdasarkan id.
 * Dipakai oleh route edit/detail artikel dan page.
 */
export async function loadFullPost(db: any, tenantId: string, id: string) {
  const result = await db.query(
    `
    select *
    from public.posts
    where id = $1
      and tenant_id = $2
      and deleted_at is null
    limit 1
    `,
    [id, tenantId]
  )

  return result.rows?.[0] || null
}


/**
 * Compatibility helpers untuk route admin content.
 * Dipakai agar API artikel/page tetap aman saat route lama memanggil helper ini.
 */

export function normalizeContentType(value: any): "post" | "page" {
  const v = String(value || "post").toLowerCase().trim()
  return v === "page" ? "page" : "post"
}

export function normalizeStatus(value: any): "draft" | "published" | "archived" {
  const v = String(value || "draft").toLowerCase().trim()
  if (v === "published") return "published"
  if (v === "archived") return "archived"
  return "draft"
}

export async function readJson(req: any): Promise<any> {
  try {
    return await req.json()
  } catch {
    return {}
  }
}



/**
 * Sinkron blok konten artikel/page.
 * Aman untuk build dan runtime.
 * Jika tabel post_blocks belum ada, fungsi tidak membuat API gagal.
 */
export async function syncBlocks(
  db: any,
  tenantId: string,
  postId: string,
  blocks: any[] = []
) {
  try {
    if (!db || typeof db.query !== "function") {
      return []
    }

    if (!tenantId || !postId) {
      return []
    }

    const cleanBlocks = Array.isArray(blocks) ? blocks : []

    await db.query(
      `
      delete from public.post_blocks
      where tenant_id = $1 and post_id = $2
      `,
      [tenantId, postId]
    )

    if (cleanBlocks.length === 0) {
      return []
    }

    const saved = []

    for (let i = 0; i < cleanBlocks.length; i++) {
      const block = cleanBlocks[i] || {}

      const result = await db.query(
        `
        insert into public.post_blocks (
          tenant_id,
          post_id,
          block_type,
          content,
          sort_order
        )
        values ($1, $2, $3, $4::jsonb, $5)
        returning *
        `,
        [
          tenantId,
          postId,
          block.type || block.block_type || "paragraph",
          JSON.stringify(block.content ?? block),
          i
        ]
      )

      if (result.rows?.[0]) {
        saved.push(result.rows[0])
      }
    }

    return saved
  } catch (err) {
    console.warn("syncBlocks skipped:", err)
    return []
  }
}


/**
 * Sinkron data SEO artikel/page.
 * Aman untuk build.
 * Jika tabel post_seo belum ada, fungsi dilewati agar API tidak mati.
 */
export async function syncSeo(
  db: any,
  tenantId: string,
  postId: string,
  payload: any = {}
) {
  try {
    if (!db || typeof db.query !== "function") return null
    if (!tenantId || !postId) return null

    const metaTitle =
      payload.meta_title ??
      payload.seo_title ??
      payload.title ??
      ""

    const metaDescription =
      payload.meta_description ??
      payload.seo_description ??
      payload.excerpt ??
      ""

    const canonicalUrl =
      payload.canonical_url ??
      payload.canonical ??
      null

    const schemaJson =
      payload.schema_json ??
      payload.schemaJson ??
      {}

    await db.query(
      `
      update public.posts
      set
        meta_title = $3,
        meta_description = $4,
        canonical_url = $5,
        schema_json = $6::jsonb,
        updated_at = now()
      where tenant_id = $1
        and id = $2
      `,
      [
        tenantId,
        postId,
        metaTitle,
        metaDescription,
        canonicalUrl,
        JSON.stringify(schemaJson || {})
      ]
    )

    try {
      const result = await db.query(
        `
        insert into public.post_seo (
          tenant_id,
          post_id,
          meta_title,
          meta_description,
          canonical_url,
          schema_json
        )
        values ($1, $2, $3, $4, $5, $6::jsonb)
        on conflict (tenant_id, post_id)
        do update set
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          canonical_url = excluded.canonical_url,
          schema_json = excluded.schema_json,
          updated_at = now()
        returning *
        `,
        [
          tenantId,
          postId,
          metaTitle,
          metaDescription,
          canonicalUrl,
          JSON.stringify(schemaJson || {})
        ]
      )

      return result.rows?.[0] || null
    } catch (err) {
      console.warn("syncSeo post_seo skipped:", err)
      return null
    }
  } catch (err) {
    console.warn("syncSeo skipped:", err)
    return null
  }
}


/**
 * Sinkron kategori dan tag artikel/page.
 * Aman untuk build.
 * Jika tabel relasi belum ada, fungsi dilewati agar API tetap jalan.
 */
export async function syncTaxonomy(
  db: any,
  tenantId: string,
  postId: string,
  payload: any = {}
) {
  try {
    if (!db || typeof db.query !== "function") return null
    if (!tenantId || !postId) return null

    const categories = Array.isArray(payload.categories)
      ? payload.categories
      : []

    const tags = Array.isArray(payload.tags)
      ? payload.tags
      : []

    try {
      await db.query(
        `delete from public.post_categories where tenant_id = $1 and post_id = $2`,
        [tenantId, postId]
      )

      for (const item of categories) {
        const name = String(item?.name || item || "").trim()
        if (!name) continue

        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")

        const cat = await db.query(
          `
          insert into public.categories (tenant_id, name, slug)
          values ($1, $2, $3)
          on conflict do nothing
          returning id
          `,
          [tenantId, name, slug]
        )

        let categoryId = cat.rows?.[0]?.id

        if (!categoryId) {
          const existing = await db.query(
            `select id from public.categories where tenant_id = $1 and slug = $2 limit 1`,
            [tenantId, slug]
          )
          categoryId = existing.rows?.[0]?.id
        }

        if (categoryId) {
          await db.query(
            `
            insert into public.post_categories (tenant_id, post_id, category_id)
            values ($1, $2, $3)
            on conflict do nothing
            `,
            [tenantId, postId, categoryId]
          )
        }
      }
    } catch (err) {
      console.warn("syncTaxonomy categories skipped:", err)
    }

    try {
      await db.query(
        `delete from public.post_tags where tenant_id = $1 and post_id = $2`,
        [tenantId, postId]
      )

      for (const item of tags) {
        const name = String(item?.name || item || "").trim()
        if (!name) continue

        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")

        const tag = await db.query(
          `
          insert into public.tags (tenant_id, name, slug)
          values ($1, $2, $3)
          on conflict do nothing
          returning id
          `,
          [tenantId, name, slug]
        )

        let tagId = tag.rows?.[0]?.id

        if (!tagId) {
          const existing = await db.query(
            `select id from public.tags where tenant_id = $1 and slug = $2 limit 1`,
            [tenantId, slug]
          )
          tagId = existing.rows?.[0]?.id
        }

        if (tagId) {
          await db.query(
            `
            insert into public.post_tags (tenant_id, post_id, tag_id)
            values ($1, $2, $3)
            on conflict do nothing
            `,
            [tenantId, postId, tagId]
          )
        }
      }
    } catch (err) {
      console.warn("syncTaxonomy tags skipped:", err)
    }

    return {
      categories,
      tags
    }
  } catch (err) {
    console.warn("syncTaxonomy skipped:", err)
    return null
  }
}
