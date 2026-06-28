create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- =========================================================
-- 1. MEDIA DASAR UNTUK COVER, GAMBAR ARTIKEL, DAN FILE PAGE
-- =========================================================

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  uploaded_by uuid,
  bucket text not null default 'media',
  path text not null,
  public_url text,
  file_name text,
  mime_type text,
  size_bytes bigint default 0,
  width int,
  height int,
  alt_text text,
  caption text,
  blurhash text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists media_assets_tenant_idx
  on public.media_assets (tenant_id);

create index if not exists media_assets_path_idx
  on public.media_assets (path);

create index if not exists media_assets_mime_idx
  on public.media_assets (mime_type);

-- =========================================================
-- 2. POSTS UTAMA, DIPAKAI UNTUK ARTIKEL DAN PAGE
-- =========================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  slug text not null,
  excerpt text,
  content text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists tenant_id uuid,
  add column if not exists author_id uuid,
  add column if not exists editor_id uuid,
  add column if not exists content_type text not null default 'post',
  add column if not exists subtitle text,
  add column if not exists content_html text,
  add column if not exists content_json jsonb not null default '{}',
  add column if not exists blocks jsonb not null default '[]',
  add column if not exists cover_media_id uuid,
  add column if not exists cover_url text,
  add column if not exists thumbnail_url text,
  add column if not exists language_code text not null default 'id',
  add column if not exists locale text not null default 'id-ID',
  add column if not exists visibility text not null default 'public',
  add column if not exists password_hash text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_homepage boolean not null default false,
  add column if not exists template_key text default 'default',
  add column if not exists layout_key text default 'article',
  add column if not exists parent_id uuid,
  add column if not exists sort_order int not null default 0,
  add column if not exists reading_time_minutes int not null default 0,
  add column if not exists word_count int not null default 0,
  add column if not exists view_count bigint not null default 0,
  add column if not exists like_count bigint not null default 0,
  add column if not exists comment_count bigint not null default 0,
  add column if not exists scheduled_at timestamptz,
  add column if not exists first_published_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists metadata jsonb not null default '{}',
  add column if not exists settings jsonb not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.posts'::regclass
      and attname = 'search_vector'
      and not attisdropped
  ) then
    alter table public.posts
    add column search_vector tsvector generated always as (
      setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(content, '')), 'C')
    ) stored;
  end if;
end $$;

create index if not exists posts_tenant_idx
  on public.posts (tenant_id);

create index if not exists posts_type_idx
  on public.posts (content_type);

create index if not exists posts_status_idx
  on public.posts (status);

create index if not exists posts_tenant_type_status_idx
  on public.posts (tenant_id, content_type, status);

create index if not exists posts_slug_idx
  on public.posts (slug);

create index if not exists posts_published_at_idx
  on public.posts (published_at desc);

create index if not exists posts_deleted_at_idx
  on public.posts (deleted_at);

create index if not exists posts_search_idx
  on public.posts using gin (search_vector);

create index if not exists posts_title_trgm_idx
  on public.posts using gin (title gin_trgm_ops);

create unique index if not exists posts_tenant_type_slug_unique_idx
  on public.posts (tenant_id, content_type, slug)
  where deleted_at is null;

-- =========================================================
-- 3. SEO ARTIKEL DAN PAGE
-- =========================================================

create table if not exists public.post_seo (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  meta_title text,
  meta_description text,
  focus_keyword text,
  secondary_keywords text[] not null default '{}',
  canonical_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  schema_type text default 'Article',
  schema_json jsonb not null default '{}',
  seo_score int not null default 0,
  readability_score int not null default 0,
  internal_link_score int not null default 0,
  keyword_density numeric(6,2) not null default 0,
  last_audited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id)
);

create index if not exists post_seo_tenant_idx
  on public.post_seo (tenant_id);

create index if not exists post_seo_keyword_idx
  on public.post_seo using gin (secondary_keywords);

-- =========================================================
-- 4. REVISI ARTIKEL DAN PAGE
-- =========================================================

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  version_no int not null default 1,
  title text,
  slug text,
  excerpt text,
  content text,
  content_html text,
  content_json jsonb not null default '{}',
  blocks jsonb not null default '[]',
  seo jsonb not null default '{}',
  change_note text,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique(post_id, version_no)
);

create index if not exists post_revisions_post_idx
  on public.post_revisions (post_id, version_no desc);

create index if not exists post_revisions_tenant_idx
  on public.post_revisions (tenant_id);

-- =========================================================
-- 5. KATEGORI DAN TAG
-- =========================================================

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  parent_id uuid references public.post_categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  color text,
  icon text,
  sort_order int not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_categories_tenant_slug_unique_idx
  on public.post_categories (tenant_id, slug);

create index if not exists post_categories_parent_idx
  on public.post_categories (parent_id);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  name text not null,
  slug text not null,
  description text,
  color text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_tags_tenant_slug_unique_idx
  on public.post_tags (tenant_id, slug);

create table if not exists public.post_category_map (
  post_id uuid not null references public.posts(id) on delete cascade,
  category_id uuid not null references public.post_categories(id) on delete cascade,
  tenant_id uuid,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

create index if not exists post_category_map_tenant_idx
  on public.post_category_map (tenant_id);

create table if not exists public.post_tag_map (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  tenant_id uuid,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create index if not exists post_tag_map_tenant_idx
  on public.post_tag_map (tenant_id);

-- =========================================================
-- 6. BLOCK EDITOR DAN TEMPLATE CONTENT
-- =========================================================

create table if not exists public.post_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  block_key text not null,
  block_type text not null,
  position int not null default 0,
  data jsonb not null default '{}',
  html_cache text,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, block_key)
);

create index if not exists post_blocks_post_position_idx
  on public.post_blocks (post_id, position);

create index if not exists post_blocks_tenant_idx
  on public.post_blocks (tenant_id);

create table if not exists public.page_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  name text not null,
  template_key text not null,
  description text,
  preview_image_url text,
  template_type text not null default 'page',
  blocks jsonb not null default '[]',
  settings jsonb not null default '{}',
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists page_templates_tenant_key_unique_idx
  on public.page_templates (tenant_id, template_key);

-- =========================================================
-- 7. ROUTING, SLUG HISTORY, DAN REDIRECT
-- =========================================================

create table if not exists public.content_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  post_id uuid references public.posts(id) on delete cascade,
  path text not null,
  route_type text not null default 'post',
  status_code int not null default 200,
  is_active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_routes_tenant_path_active_unique_idx
  on public.content_routes (tenant_id, path)
  where is_active = true;

create index if not exists content_routes_post_idx
  on public.content_routes (post_id);

create table if not exists public.post_slug_history (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  old_slug text not null,
  new_slug text not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create index if not exists post_slug_history_old_slug_idx
  on public.post_slug_history (tenant_id, old_slug);

create table if not exists public.post_redirects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  source_path text not null,
  target_path text not null,
  status_code int not null default 301,
  is_active boolean not null default true,
  hit_count bigint not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists post_redirects_tenant_source_unique_idx
  on public.post_redirects (tenant_id, source_path)
  where is_active = true;

-- =========================================================
-- 8. EDITOR LOCK, WORKFLOW, DAN REVIEW
-- =========================================================

create table if not exists public.post_locks (
  post_id uuid primary key references public.posts(id) on delete cascade,
  tenant_id uuid,
  locked_by uuid,
  locked_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes'
);

create index if not exists post_locks_tenant_idx
  on public.post_locks (tenant_id);

create table if not exists public.post_workflow_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  actor_id uuid,
  event_type text not null,
  from_status text,
  to_status text,
  note text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists post_workflow_events_post_idx
  on public.post_workflow_events (post_id, created_at desc);

create index if not exists post_workflow_events_tenant_idx
  on public.post_workflow_events (tenant_id);

-- =========================================================
-- 9. KOMENTAR ARTIKEL
-- =========================================================

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.post_comments(id) on delete cascade,
  profile_id uuid,
  author_name text,
  author_email text,
  author_url text,
  body text not null,
  status text not null default 'pending',
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, status, created_at desc);

create index if not exists post_comments_tenant_idx
  on public.post_comments (tenant_id);

-- =========================================================
-- 10. ANALYTICS RINGKAS PER POST/PAGE
-- =========================================================

create table if not exists public.post_daily_stats (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  post_id uuid not null references public.posts(id) on delete cascade,
  stat_date date not null,
  views bigint not null default 0,
  unique_visitors bigint not null default 0,
  reads bigint not null default 0,
  avg_read_seconds numeric(10,2) not null default 0,
  bounce_count bigint not null default 0,
  share_count bigint not null default 0,
  comment_count bigint not null default 0,
  conversion_count bigint not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, stat_date)
);

create index if not exists post_daily_stats_tenant_date_idx
  on public.post_daily_stats (tenant_id, stat_date desc);

create index if not exists post_daily_stats_post_date_idx
  on public.post_daily_stats (post_id, stat_date desc);

-- =========================================================
-- 11. INTERNAL LINK DAN CONTENT RELATION
-- =========================================================

create table if not exists public.post_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  source_post_id uuid not null references public.posts(id) on delete cascade,
  target_post_id uuid references public.posts(id) on delete set null,
  target_url text,
  anchor_text text,
  link_type text not null default 'internal',
  rel text,
  is_broken boolean not null default false,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists post_links_source_idx
  on public.post_links (source_post_id);

create index if not exists post_links_target_idx
  on public.post_links (target_post_id);

create table if not exists public.post_related (
  post_id uuid not null references public.posts(id) on delete cascade,
  related_post_id uuid not null references public.posts(id) on delete cascade,
  tenant_id uuid,
  relation_type text not null default 'related',
  score numeric(8,4) not null default 0,
  created_at timestamptz not null default now(),
  primary key (post_id, related_post_id)
);

create index if not exists post_related_tenant_idx
  on public.post_related (tenant_id);

-- =========================================================
-- 12. UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists post_seo_set_updated_at on public.post_seo;
create trigger post_seo_set_updated_at
before update on public.post_seo
for each row execute function public.set_updated_at();

drop trigger if exists post_categories_set_updated_at on public.post_categories;
create trigger post_categories_set_updated_at
before update on public.post_categories
for each row execute function public.set_updated_at();

drop trigger if exists post_tags_set_updated_at on public.post_tags;
create trigger post_tags_set_updated_at
before update on public.post_tags
for each row execute function public.set_updated_at();

drop trigger if exists post_blocks_set_updated_at on public.post_blocks;
create trigger post_blocks_set_updated_at
before update on public.post_blocks
for each row execute function public.set_updated_at();

drop trigger if exists page_templates_set_updated_at on public.page_templates;
create trigger page_templates_set_updated_at
before update on public.page_templates
for each row execute function public.set_updated_at();

drop trigger if exists content_routes_set_updated_at on public.content_routes;
create trigger content_routes_set_updated_at
before update on public.content_routes
for each row execute function public.set_updated_at();

drop trigger if exists post_redirects_set_updated_at on public.post_redirects;
create trigger post_redirects_set_updated_at
before update on public.post_redirects
for each row execute function public.set_updated_at();

drop trigger if exists post_comments_set_updated_at on public.post_comments;
create trigger post_comments_set_updated_at
before update on public.post_comments
for each row execute function public.set_updated_at();

drop trigger if exists post_daily_stats_set_updated_at on public.post_daily_stats;
create trigger post_daily_stats_set_updated_at
before update on public.post_daily_stats
for each row execute function public.set_updated_at();

-- ======================================================
-- 13. VIEW UNTUK ADMIN CONTENT
-- =========================================================

create or replace view public.admin_content_overview as
select
  p.id,
  p.tenant_id,
  p.content_type,
  p.title,
  p.slug,
  p.status,
  p.visibility,
  p.is_featured,
  p.is_homepage,
  p.published_at,
  p.created_at,
  p.updated_at,
  p.view_count,
  p.word_count,
  p.reading_time_minutes,
  s.seo_score,
  s.readability_score,
  s.focus_keyword,
  coalesce(array_agg(distinct c.name) filter (where c.id is not null), '{}') as categories,
  coalesce(array_agg(distinct t.name) filter (where t.id is not null), '{}') as tags
from public.posts p
left join public.post_seo s on s.post_id = p.id
left join public.post_category_map pcm on pcm.post_id = p.id
left join public.post_categories c on c.id = pcm.category_id
left join public.post_tag_map ptm on ptm.post_id = p.id
left join public.post_tags t on t.id = ptm.tag_id
where p.deleted_at is null
group by
  p.id,
  s.seo_score,
  s.readability_score,
  s.focus_keyword;

-- =========================================================
-- 14. SEED TEMPLATE DASAR
-- =========================================================

insert into public.page_templates
  (tenant_id, name, template_key, description, template_type, blocks, settings, is_system, is_active)
values
  (
    null,
    'Default Article',
    'default-article',
    'Template standar untuk artikel blog.',
    'post',
    '[
      {"type":"hero","label":"Hero Artikel"},
      {"type":"content","label":"Konten Artikel"},
      {"type":"related","label":"Artikel Terkait"}
    ]'::jsonb,
    '{"layout":"article","width":"normal"}'::jsonb,
    true,
    true
  ),
  (
    null,
    'Landing Page',
    'landing-page',
    'Template untuk halaman promosi, produk, dan funnel.',
    'page',
    '[
      {"type":"hero","label":"Hero"},
      {"type":"features","label":"Fitur"},
      {"type":"pricing","label":"Harga"},
      {"type":"faq","label":"FAQ"},
      {"type":"cta","label":"CTA"}
    ]'::jsonb,
    '{"layout":"landing","width":"wide"}'::jsonb,
    true,
    true
  )
on conflict do nothing;

