create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  title text not null default 'Untitled',
  slug text not null,
  excerpt text,
  cover_image_url text,
  status text not null default 'draft',
  visibility text not null default 'public',
  seo_title text,
  seo_description text,
  seo_keywords text[],
  canonical_url text,
  language text default 'id',
  reading_time int default 0,
  word_count int default 0,
  view_count bigint not null default 0,
  like_count bigint not null default 0,
  comment_count bigint not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts add column if not exists tenant_id uuid references tenants(id) on delete cascade;
alter table posts add column if not exists author_id uuid references profiles(id) on delete set null;
alter table posts add column if not exists cover_image_url text;
alter table posts add column if not exists visibility text not null default 'public';
alter table posts add column if not exists seo_title text;
alter table posts add column if not exists seo_description text;
alter table posts add column if not exists seo_keywords text[];
alter table posts add column if not exists canonical_url text;
alter table posts add column if not exists language text default 'id';
alter table posts add column if not exists reading_time int default 0;
alter table posts add column if not exists word_count int default 0;
alter table posts add column if not exists view_count bigint not null default 0;
alter table posts add column if not exists like_count bigint not null default 0;
alter table posts add column if not exists comment_count bigint not null default 0;
alter table posts add column if not exists scheduled_at timestamptz;
alter table posts add column if not exists updated_at timestamptz not null default now();

update posts
set tenant_id = (select id from tenants where slug = 'triapriyogi' limit 1)
where tenant_id is null;

create index if not exists posts_tenant_idx on posts(tenant_id);
create index if not exists posts_status_idx on posts(status);
create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists posts_created_at_idx on posts(created_at desc);

create table if not exists post_contents (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  content_html text,
  version int not null default 1,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists post_contents_post_idx on post_contents(post_id);
create index if not exists post_contents_current_idx on post_contents(post_id, is_current);

create table if not exists post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  title text,
  excerpt text,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  change_note text,
  created_at timestamptz not null default now()
);

create table if not exists post_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists post_categories_tenant_idx on post_categories(tenant_id);

create table if not exists post_category_links (
  post_id uuid not null references posts(id) on delete cascade,
  category_id uuid not null references post_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

create table if not exists post_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_tags_tenant_idx on post_tags(tenant_id);

create table if not exists post_tag_links (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references post_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists post_search (
  post_id uuid primary key references posts(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  title text,
  excerpt text,
  search_text text,
  updated_at timestamptz not null default now()
);

create index if not exists post_search_tenant_idx on post_search(tenant_id);

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
before update on posts
for each row execute function set_updated_at();
