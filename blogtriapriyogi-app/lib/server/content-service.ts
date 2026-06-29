import type { PoolClient } from "pg"

const VALID_CONTENT_TYPES = new Set(["post", "page"])
const VALID_STATUS = new Set(["draft", "review", "scheduled", "published", "archived", "deleted"])

export async function readJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

export function getTenantId(req: Request, body?: any) {
  const headerTenant = req.headers.get("x-tenant-id")
  const value = body?.tenant_id || headerTenant || null

  if (!value || value === "null" || value === "undefined") return null

  return String(value)
}

export function getActorId(req: Request, body?: any) {
  const value = body?.actor_id || body?.author_id || req.headers.get("x-user-id") || null

  if (!value || value === "null" || value === "undefined") return null

  return String(value)
}

export function slugify(value: string) {
  const slug = String(value || "untitled")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)

  return slug || "untitled"
}

export function normalizeContentType(value: any) {
  const type = String(value || "post").toLowerCase()

  if (!VALID_CONTENT_TYPES.has(type)) {
    throw new Error("content_type harus post atau page")
  }

  return type
}

export function normalizeStatus(value: any) {
  const status = String(value || "draft").toLowerCase()

  if (!VALID_STATUS.has(status)) {
    throw new Error("status tidak valid")
  }

  return status
}

function jsonValue(value: any, fallback: any) {
  if (value === undefined) return fallback
  return JSON.stringify(value ?? fallback)
}

export async function ensureUniqueSlug(
  client: PoolClient,
  tenantId: string | null,
  contentType: string,
  rawSlug: string,
  exceptId?: string
) {
  const base = slugify(rawSlug)
  let slug = base

  for (let i = 2; i < 1000; i++) {
    const params: any[] = [tenantId, contentType, slug]
    let sql = `
      select 1
      from public.posts
      where tenant_id is not distinct from $1
        and content_type = $2
        and slug = $3
        and deleted_at is null
    `

    if (exceptId) {
      params.push(exceptId)
      sql += ` and id <> $4`
    }

    sql += ` limit 1`

    const exists = await client.query(sql, params)

    if (exists.rowCount === 0) return slug

    slug = `${base}-${i}`
  }

  return `${base}-${Date.now()}`
}

function normalizeTerm(input: any) {
  if (!input) return null

  if (typeof input === "string") {
    return {
      name: input,
      slug: slugify(input),
      description: null,
      color: null,
      metadata: {},
    }
  }

  const name = input.name || input.title || input.slug

  if (!name) return null

  return {
    name: String(name),
    slug: slugify(input.slug || name),
    description: input.description || null,
    color: input.color || null,
    metadata: input.metadata || {},
  }
}

async function findOrCreateCategory(client: PoolClient, tenantId: string | null, input: any) {
  const term = normalizeTerm(input)
  if (!term) return null

  const found = await client.query(
    `
    select id
    from public.post_categories
    where tenant_id is not distinct from $1
      and slug = $2
    limit 1
    `,
    [tenantId, term.slug]
  )

  if (found.rowCount) return found.rows[0].id

  const created = await client.query(
    `
    insert into public.post_categories
      (tenant_id, name, slug, description, color, metadata)
    values
      ($1, $2, $3, $4, $5, $6::jsonb)
    returning id
    `,
    [tenantId, term.name, term.slug, term.description, term.color, JSON.stringify(term.metadata)]
  )

  return created.rows[0].id
}

async function findOrCreateTag(client: PoolClient, tenantId: string | null, input: any) {
  const term = normalizeTerm(input)
  if (!term) return null

  const found = await client.query(
    `
    select id
    from public.post_tags
    where tenant_id is not distinct from $1
      and slug = $2
    limit 1
    `,
    [tenantId, term.slug]
  )

  if (found.rowCount) return found.rows[0].id

  const created = await client.query(
    `
    insert into public.post_tags
      (tenant_id, name, slug, description, color, metadata)
    values
      ($1, $2, $3, $4, $5, $6::jsonb)
    returning id
    `,
    [tenantId, term.name, term.slug, term.description, term.color, JSON.stringify(term.metadata)]
  )

  return created.rows[0].id
}

export async function syncTaxonomy(
  client: PoolClient,
  tenantId: string | null,
  postId: string,
  categories: any[] | undefined,
  tags: any[] | undefined
) {
  if (Array.isArray(categories)) {
    await client.query(`delete from public.post_category_map where post_id = $1`, [postId])

    for (const item of categories) {
      const categoryId = await findOrCreateCategory(client, tenantId, item)
      if (!categoryId) continue

      await client.query(
        `
        insert into public.post_category_map
          (post_id, category_id, tenant_id)
        values
          ($1, $2, $3)
        on conflict do nothing
        `,
        [postId, categoryId, tenantId]
      )
    }
  }

  if (Array.isArray(tags)) {
    await client.query(`delete from public.post_tag_map where post_id = $1`, [postId])

    for (const item of tags) {
      const tagId = await findOrCreateTag(client, tenantId, item)
      if (!tagId) continue

      await client.query(
        `
        insert into public.post_tag_map
          (post_id, tag_id, tenant_id)
        values
          ($1, $2, $3)
        on conflict do nothing
        `,
        [postId, tagId, tenantId]
      )
    }
  }
}

export async function syncSeo(
  client: PoolClient,
  tenantId: string | null,
  postId: string,
  seo: any
) {
  if (!seo || typeof seo !== "object") return

  await client.query(
    `
    insert into public.post_seo (
      post_id,
      tenant_id,
      meta_title,
      meta_description,
      focus_keyword,
      secondary_keywords,
      canonical_url,
      robots_index,
      robots_follow,
      og_title,
      og_description,
      og_image_url,
      twitter_title,
      twitter_description,
      twitter_image_url,
      schema_type,
      schema_json,
      seo_score,
      readability_score,
      internal_link_score,
      keyword_density,
      last_audited_at
    )
    values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,now()
    )
    on conflict (post_id)
    do update set
      tenant_id = excluded.tenant_id,
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      focus_keyword = excluded.focus_keyword,
      secondary_keywords = excluded.secondary_keywords,
      canonical_url = excluded.canonical_url,
      robots_index = excluded.robots_index,
      robots_follow = excluded.robots_follow,
      og_title = excluded.og_title,
      og_description = excluded.og_description,
      og_image_url = excluded.og_image_url,
      twitter_title = excluded.twitter_title,
      twitter_description = excluded.twitter_description,
      twitter_image_url = excluded.twitter_image_url,
      schema_type = excluded.schema_type,
      schema_json = excluded.schema_json,
      seo_score = excluded.seo_score,
      readability_score = excluded.readability_score,
      internal_link_score = excluded.internal_link_score,
      keyword_density = excluded.keyword_density,
      last_audited_at = now(),
      updated_at = now()
    `,
    [
      postId,
      tenantId,
      seo.meta_title || seo.metaTitle || null,
      seo.meta_description || seo.metaDescription || null,
      seo.focus_keyword || seo.focusKeyword || null,
      Array.isArray(seo.secondary_keywords)
        ? seo.secondary_keywords
        : Array.isArray(seo.secondaryKeywords)
          ? seo.secondaryKeywords
          : [],
      seo.canonical_url || seo.canonicalUrl || null,
      seo.robots_index ?? seo.robotsIndex ?? true,
      seo.robots_follow ?? seo.robotsFollow ?? true,
      seo.og_title || seo.ogTitle || null,
      seo.og_description || seo.ogDescription || null,
      seo.og_image_url || seo.ogImageUrl || null,
      seo.twitter_title || seo.twitterTitle || null,
      seo.twitter_description || seo.twitterDescription || null,
      seo.twitter_image_url || seo.twitterImageUrl || null,
      seo.schema_type || seo.schemaType || "Article",
      JSON.stringify(seo.schema_json || seo.schemaJson || {}),
      Number(seo.seo_score ?? seo.seoScore ?? 0),
      Number(seo.readability_score ?? seo.readabilityScore ?? 0),
      Number(seo.internal_link_score ?? seo.internalLinkScore ?? 0),
      Number(seo.keyword_density ?? seo.keywordDensity ?? 0),
    ]
  )
}

export async function syncBlocks(
  client: PoolClient,
  tenantId: string | null,
  postId: string,
  blocks: any[] | undefined
) {
  if (!Array.isArray(blocks)) return

  await client.query(`delete from public.post_blocks where post_id = $1`, [postId])

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] || {}
    const blockKey = block.key || block.id || `block-${i + 1}`
    const blockType = block.type || "custom"

    await client.query(
      `
      insert into public.post_blocks (
        post_id,
        tenant_id,
        block_key,
        block_type,
        position,
        data,
        html_cache,
        is_locked
      )
      values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)
      `,
      [
        postId,
        tenantId,
        String(blockKey),
        String(blockType),
        i,
        JSON.stringify(block.data || block),
        block.html_cache || block.html || null,
        Boolean(block.is_locked || block.locked || false),
      ]
    )
  }
}

export async function createRevision(
  client: PoolClient,
  tenantId: string | null,
  post: any,
  actorId: string | null,
  note: string
) {
  const version = await client.query(
    `
    select coalesce(max(version_no), 0) + 1 as next_version
    from public.post_revisions
    where post_id = $1
    `,
    [post.id]
  )

  await client.query(
    `
    insert into public.post_revisions (
      post_id,
      tenant_id,
      version_no,
      title,
      slug,
      excerpt,
      content,
      content_html,
      content_json,
      blocks,
      seo,
      change_note,
      created_by
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13)
    `,
    [
      post.id,
      tenantId,
      Number(version.rows[0].next_version || 1),
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.content_html,
      JSON.stringify(post.content_json || {}),
      JSON.stringify(post.blocks || []),
      JSON.stringify({}),
      note,
      actorId,
    ]
  )
}

export async function addWorkflowEvent(
  client: PoolClient,
  tenantId: string | null,
  postId: string,
  actorId: string | null,
  eventType: string,
  fromStatus: string | null,
  toStatus: string | null,
  note?: string
) {
  await client.query(
    `
    insert into public.post_workflow_events (
      post_id,
      tenant_id,
      actor_id,
      event_type,
      from_status,
      to_status,
      note
    )
    values ($1,$2,$3,$4,$5,$6,$7)
    `,
    [postId, tenantId, actorId, eventType, fromStatus, toStatus, note || null]
  )
}

export async function loadFullPost(client: PoolClient, id: string) {
  const post = await client.query(
    `
    select *
    from public.posts
    where id = $1
    limit 1
    `,
    [id]
  )

  if (!post.rowCount) return null

  const seo = await client.query(
    `
    select *
    from public.post_seo
    where post_id = $1
    limit 1
    `,
    [id]
  )

  const categories = await client.query(
    `
    select c.*
    from public.post_categories c
    join public.post_category_map m on m.category_id = c.id
    where m.post_id = $1
    order by c.name asc
    `,
    [id]
  )

  const tags = await client.query(
    `
    select t.*
    from public.post_tags t
    join public.post_tag_map m on m.tag_id = t.id
    where m.post_id = $1
    order by t.name asc
    `,
    [id]
  )

  const blocks = await client.query(
    `
    select *
    from public.post_blocks
    where post_id = $1
    order by position asc
    `,
    [id]
  )

  return {
    ...post.rows[0],
    seo: seo.rows[0] || null,
    categories: categories.rows,
    tags: tags.rows,
    editor_blocks: blocks.rows,
  }
}

export function buildInsertData(body: any, tenantId: string | null, actorId: string | null, slug: string) {
  const status = normalizeStatus(body.status || "draft")
  const nowPublished = status === "published" ? new Date() : null

  return {
    tenant_id: tenantId,
    author_id: body.author_id || actorId,
    editor_id: body.editor_id || actorId,
    content_type: normalizeContentType(body.content_type || body.type || "post"),
    title: body.title || "Untitled",
    slug,
    subtitle: body.subtitle || null,
    excerpt: body.excerpt || "",
    content: body.content || "",
    content_html: body.content_html || body.contentHtml || null,
    content_json: jsonValue(body.content_json || body.contentJson, {}),
    blocks: jsonValue(body.blocks, []),
    cover_media_id: body.cover_media_id || body.coverMediaId || null,
    cover_url: body.cover_url || body.coverUrl || null,
    thumbnail_url: body.thumbnail_url || body.thumbnailUrl || null,
    language_code: body.language_code || body.languageCode || "id",
    locale: body.locale || "id-ID",
    visibility: body.visibility || "public",
    password_hash: body.password_hash || body.passwordHash || null,
    is_featured: Boolean(body.is_featured || body.isFeatured || false),
    is_pinned: Boolean(body.is_pinned || body.isPinned || false),
    is_homepage: Boolean(body.is_homepage || body.isHomepage || false),
    template_key: body.template_key || body.templateKey || "default",
    layout_key: body.layout_key || body.layoutKey || "article",
    parent_id: body.parent_id || body.parentId || null,
    sort_order: Number(body.sort_order ?? body.sortOrder ?? 0),
    reading_time_minutes: Number(body.reading_time_minutes ?? body.readingTimeMinutes ?? 0),
    word_count: Number(body.word_count ?? body.wordCount ?? 0),
    status,
    scheduled_at: body.scheduled_at || body.scheduledAt || null,
    published_at: body.published_at || body.publishedAt || nowPublished,
    first_published_at: body.first_published_at || body.firstPublishedAt || nowPublished,
    metadata: jsonValue(body.metadata, {}),
    settings: jsonValue(body.settings, {}),
  }
}

export function buildUpdateData(body: any) {
  const data: Record<string, any> = {}

  const map: Record<string, string> = {
    title: "title",
    subtitle: "subtitle",
    excerpt: "excerpt",
    content: "content",
    content_html: "content_html",
    contentHtml: "content_html",
    content_json: "content_json",
    contentJson: "content_json",
    blocks: "blocks",
    cover_media_id: "cover_media_id",
    coverMediaId: "cover_media_id",
    cover_url: "cover_url",
    coverUrl: "cover_url",
    thumbnail_url: "thumbnail_url",
    thumbnailUrl: "thumbnail_url",
    language_code: "language_code",
    languageCode: "language_code",
    locale: "locale",
    visibility: "visibility",
    password_hash: "password_hash",
    passwordHash: "password_hash",
    is_featured: "is_featured",
    isFeatured: "is_featured",
    is_pinned: "is_pinned",
    isPinned: "is_pinned",
    is_homepage: "is_homepage",
    isHomepage: "is_homepage",
    template_key: "template_key",
    templateKey: "template_key",
    layout_key: "layout_key",
    layoutKey: "layout_key",
    parent_id: "parent_id",
    parentId: "parent_id",
    sort_order: "sort_order",
    sortOrder: "sort_order",
    reading_time_minutes: "reading_time_minutes",
    readingTimeMinutes: "reading_time_minutes",
    word_count: "word_count",
    wordCount: "word_count",
    status: "status",
    scheduled_at: "scheduled_at",
    scheduledAt: "scheduled_at",
    metadata: "metadata",
    settings: "settings",
  }

  for (const [inputKey, column] of Object.entries(map)) {
    if (body[inputKey] === undefined) continue

    if (["content_json", "blocks", "metadata", "settings"].includes(column)) {
      data[column] = JSON.stringify(body[inputKey] ?? (column === "blocks" ? [] : {}))
    } else if (
      [
        "is_featured",
        "is_pinned",
        "is_homepage",
      ].includes(column)
    ) {
      data[column] = Boolean(body[inputKey])
    } else if (
      [
        "sort_order",
        "reading_time_minutes",
        "word_count",
      ].includes(column)
    ) {
      data[column] = Number(body[inputKey] || 0)
    } else if (column === "status") {
      data[column] = normalizeStatus(body[inputKey])
    } else {
      data[column] = body[inputKey]
    }
  }

  return data
}
