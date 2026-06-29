import { query } from "@/lib/server/db"

type Data = Record<string, any>

function slugify(text: string) {
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
