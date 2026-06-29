do $$
begin
  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type post_status as enum ('draft', 'scheduled', 'published', 'archived', 'deleted');
  end if;
end $$;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug citext not null,
  description text,
  parent_id uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug citext not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  author_profile_id uuid references profiles(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  slug citext not null,
  excerpt text,
  content_text text,
  content_html text,
  content_json jsonb not null default '{}',
  cover_media_id uuid,
  status post_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}',
  canonical_url text,
  og_image_url text,
  reading_time_minutes int not null default 0,
  word_count int not null default 0,
  view_count bigint not null default 0,
  like_count bigint not null default 0,
  comment_count bigint not null default 0,
  search_vector tsvector,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists post_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  editor_profile_id uuid references profiles(id) on delete set null,
  title text,
  excerpt text,
  content_text text,
  content_html text,
  content_json jsonb not null default '{}',
  revision_note text,
  created_at timestamptz not null default now()
);

create table if not exists post_tags (
  tenant_id uuid not null references tenants(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  author_name text,
  author_email citext,
  author_profile_id uuid references profiles(id) on delete set null,
  body text not null,
  status text not null default 'pending',
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function posts_search_vector_sync()
returns trigger as $$
begin
  new.search_vector =
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.content_text, '')), 'C');
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_search_vector_trigger on posts;
create trigger posts_search_vector_trigger
before insert or update on posts
for each row execute function posts_search_vector_sync();

create index if not exists idx_categories_tenant on categories(tenant_id);
create index if not exists idx_tags_tenant on tags(tenant_id);
create index if not exists idx_posts_tenant_status on posts(tenant_id, status);
create index if not exists idx_posts_tenant_published on posts(tenant_id, published_at desc);
create index if not exists idx_posts_category on posts(category_id);
create index if not exists idx_posts_author on posts(author_profile_id);
create index if not exists idx_posts_search_vector on posts using gin(search_vector);
create index if not exists idx_posts_title_trgm on posts using gin(title gin_trgm_ops);
create index if not exists idx_post_revisions_post on post_revisions(post_id, created_at desc);
create index if not exists idx_comments_post_status on comments(post_id, status);

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
before update on posts
for each row execute function set_updated_at();

drop trigger if exists comments_set_updated_at on comments;
create trigger comments_set_updated_at
before update on comments
for each row execute function set_updated_at();
