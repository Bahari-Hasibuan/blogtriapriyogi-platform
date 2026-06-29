import { query } from "@/lib/server/db"

async function getDefaultTenant() {
  const found = await query(`
    select *
    from public.tenants
    order by created_at asc
    limit 1
  `)

  if (found.rows[0]) return found.rows[0]

  const created = await query(`
    insert into public.tenants (name, slug)
    values ('Default Workspace', 'default')
    returning *
  `)

  return created.rows[0]
}

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

export async function listMedia() {
  const tenant = await getDefaultTenant()

  const res = await query(
    `
    select *
    from public.media_assets
    where tenant_id = $1
    and deleted_at is null
    order by created_at desc
    limit 100
    `,
    [tenant.id]
  )

  return res.rows
}

export async function createMedia(body: any) {
  const tenant = await getDefaultTenant()

  const publicUrl = String(body.public_url || body.url || "").trim()
  if (!publicUrl) throw new Error("public_url wajib diisi")

  const fileName =
    body.file_name ||
    publicUrl.split("/").pop() ||
    `media-${Date.now()}`

  const res = await query(
    `
    insert into public.media_assets
    (
      tenant_id,
      file_name,
      original_name,
      mime_type,
      public_url,
      alt_text,
      caption,
      metadata
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8)
    returning *
    `,
    [
      tenant.id,
      fileName,
      body.original_name || fileName,
      body.mime_type || "image/webp",
      publicUrl,
      body.alt_text || "",
      body.caption || "",
      JSON.stringify(body.metadata || {}),
    ]
  )

  return res.rows[0]
}

export async function getSeo(postId: string) {
  const tenant = await getDefaultTenant()

  const res = await query(
    `
    select *
    from public.post_seo
    where tenant_id = $1
    and post_id = $2
    limit 1
    `,
    [tenant.id, postId]
  )

  return res.rows[0] || null
}

export async function upsertSeo(body: any) {
  const tenant = await getDefaultTenant()

  if (!body.post_id) throw new Error("post_id wajib diisi")

  let schemaJson = body.schema_json || {}

  if (typeof schemaJson === "string") {
    schemaJson = schemaJson.trim() ? JSON.parse(schemaJson) : {}
  }

  const res = await query(
    `
    insert into public.post_seo
    (
      tenant_id,
      post_id,
      meta_title,
      meta_description,
      canonical_url,
      robots,
      schema_json,
      og_title,
      og_description,
      og_image
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    on conflict (post_id)
    do update set
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      canonical_url = excluded.canonical_url,
      robots = excluded.robots,
      schema_json = excluded.schema_json,
      og_title = excluded.og_title,
      og_description = excluded.og_description,
      og_image = excluded.og_image,
      updated_at = now()
    returning *
    `,
    [
      tenant.id,
      body.post_id,
      body.meta_title || "",
      body.meta_description || "",
      body.canonical_url || "",
      body.robots || "index,follow",
      JSON.stringify(schemaJson),
      body.og_title || "",
      body.og_description || "",
      body.og_image || "",
    ]
  )

  return res.rows[0]
}

export async function listDomains() {
  const tenant = await getDefaultTenant()

  const res = await query(
    `
    select *
    from public.domains
    where tenant_id = $1
    order by created_at desc
    `,
    [tenant.id]
  )

  return res.rows
}

export async function createDomain(body: any) {
  const tenant = await getDefaultTenant()

  const domain = String(body.domain || "").toLowerCase().trim()
  if (!domain) throw new Error("domain wajib diisi")

  const res = await query(
    `
    insert into public.domains
    (
      tenant_id,
      domain,
      domain_type,
      status
    )
    values ($1,$2,$3,'pending')
    returning *
    `,
    [tenant.id, domain, body.domain_type || "custom"]
  )

  return res.rows[0]
}

export async function verifyDomain(id: string) {
  const res = await query(
    `
    update public.domains
    set
      status = 'verified',
      verified_at = now(),
      updated_at = now()
    where id = $1
    returning *
    `,
    [id]
  )

  return res.rows[0]
}

export async function analyticsSummary() {
  const tenant = await getDefaultTenant()

  const overview = await query(
    `
    select
      count(*)::int as page_views,
      count(distinct visitor_id)::int as visitors
    from public.analytics_events
    where tenant_id = $1
    and occurred_at >= now() - interval '30 days'
    `,
    [tenant.id]
  )

  const topPosts = await query(
    `
    select
      p.id,
      p.title,
      p.slug,
      count(a.id)::int as views
    from public.analytics_events a
    left join public.posts p on p.id = a.post_id
    where a.tenant_id = $1
    group by p.id, p.title, p.slug
    order by views desc
    limit 10
    `,
    [tenant.id]
  )

  const referrers = await query(
    `
    select
      coalesce(referrer, 'direct') as referrer,
      count(*)::int as views
    from public.analytics_events
    where tenant_id = $1
    group by coalesce(referrer, 'direct')
    order by views desc
    limit 10
    `,
    [tenant.id]
  )

  return {
    overview: overview.rows[0] || { page_views: 0, visitors: 0 },
    top_posts: topPosts.rows,
    referrers: referrers.rows,
  }
}

export async function trackAnalytics(body: any, req?: Request) {
  const tenant = await getDefaultTenant()
  const userAgent = req?.headers.get("user-agent") || body.user_agent || ""

  const res = await query(
    `
    insert into public.analytics_events
    (
      tenant_id,
      post_id,
      event_name,
      pathname,
      referrer,
      country,
      device,
      browser,
      os,
      session_id,
      visitor_id,
      user_agent,
      metadata
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    returning *
    `,
    [
      tenant.id,
      body.post_id || null,
      body.event_name || "page_view",
      body.pathname || "/",
      body.referrer || "",
      body.country || "",
      body.device || "",
      body.browser || "",
      body.os || "",
      body.session_id || "",
      body.visitor_id || "",
      userAgent,
      JSON.stringify(body.metadata || {}),
    ]
  )

  return res.rows[0]
}

export async function listTemplates() {
  const tenant = await getDefaultTenant()

  const res = await query(
    `
    select *
    from public.content_templates
    where tenant_id = $1
    order by created_at desc
    `,
    [tenant.id]
  )

  return res.rows
}

export async function createTemplate(body: any) {
  const tenant = await getDefaultTenant()

  const name = body.name || "Template Baru"
  const slug = slugify(body.slug || name)

  const res = await query(
    `
    insert into public.content_templates
    (
      tenant_id,
      name,
      slug,
      template_type,
      layout_json,
      theme_json,
      is_default
    )
    values ($1,$2,$3,$4,$5,$6,$7)
    returning *
    `,
    [
      tenant.id,
      name,
      slug,
      body.template_type || "page",
      JSON.stringify(body.layout_json || {}),
      JSON.stringify(body.theme_json || {}),
      Boolean(body.is_default),
    ]
  )

  return res.rows[0]
}

export async function listPayments() {
  const tenant = await getDefaultTenant()

  const plans = await query(`
    select *
    from public.plans
    where is_active = true
    order by price_monthly asc
  `)

  const subscriptions = await query(
    `
    select *
    from public.subscriptions
    where tenant_id = $1
    order by created_at desc
    `,
    [tenant.id]
  )

  const invoices = await query(
    `
    select *
    from public.invoices
    where tenant_id = $1
    order by created_at desc
    `,
    [tenant.id]
  )

  return {
    plans: plans.rows,
    subscriptions: subscriptions.rows,
    invoices: invoices.rows,
  }
}

export async function listRoles() {
  const tenant = await getDefaultTenant()

  const profiles = await query(
    `
    select
      id,
      email,
      full_name,
      role,
      status,
      created_at
    from public.profiles
    where tenant_id = $1
    order by created_at desc
    `,
    [tenant.id]
  )

  const permissions = await query(`
    select role, permission
    from public.admin_role_permissions
    order by role, permission
  `)

  return {
    profiles: profiles.rows,
    permissions: permissions.rows,
  }
}
