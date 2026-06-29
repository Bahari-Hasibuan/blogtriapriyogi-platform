create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  type text not null default 'site',
  status text not null default 'draft',
  theme jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_tenant_idx on templates(tenant_id);
create index if not exists templates_slug_idx on templates(slug);

create table if not exists template_pages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  title text not null,
  path text not null,
  layout jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists template_pages_template_idx on template_pages(template_id);

create table if not exists template_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references template_pages(id) on delete cascade,
  block_type text not null,
  sort_order int not null default 0,
  settings jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists template_blocks_page_idx on template_blocks(page_id);
create index if not exists template_blocks_sort_idx on template_blocks(page_id, sort_order);

drop trigger if exists templates_set_updated_at on templates;
create trigger templates_set_updated_at
before update on templates
for each row execute function set_updated_at();

drop trigger if exists template_pages_set_updated_at on template_pages;
create trigger template_pages_set_updated_at
before update on template_pages
for each row execute function set_updated_at();
