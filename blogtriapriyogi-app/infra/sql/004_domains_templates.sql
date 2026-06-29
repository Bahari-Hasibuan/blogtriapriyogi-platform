create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug citext not null,
  description text,
  default_domain_id uuid,
  theme_settings jsonb not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists site_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  domain citext not null,
  domain_type text not null default 'custom',
  is_primary boolean not null default false,
  status text not null default 'pending',
  dns_target text not null default 'connect.triapriyogi.com',
  verification_type text not null default 'TXT',
  verification_name text,
  verification_value text,
  verified_at timestamptz,
  ssl_status text not null default 'pending',
  last_checked_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain)
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  slug citext not null,
  category text not null default 'blog',
  preview_image_url text,
  is_public boolean not null default false,
  config jsonb not null default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists template_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  template_id uuid not null references templates(id) on delete cascade,
  version_number int not null default 1,
  blocks jsonb not null default '[]',
  styles jsonb not null default '{}',
  status text not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (template_id, version_number)
);

create table if not exists template_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  template_id uuid references templates(id) on delete set null,
  page_type text not null,
  path text not null,
  title text,
  blocks jsonb not null default '[]',
  seo jsonb not null default '{}',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, site_id, path)
);

create index if not exists idx_sites_tenant on sites(tenant_id);
create index if not exists idx_site_domains_tenant on site_domains(tenant_id);
create index if not exists idx_site_domains_domain on site_domains(domain);
create index if not exists idx_templates_tenant on templates(tenant_id);
create index if not exists idx_template_pages_site on template_pages(site_id, path);

drop trigger if exists sites_set_updated_at on sites;
create trigger sites_set_updated_at
before update on sites
for each row execute function set_updated_at();

drop trigger if exists site_domains_set_updated_at on site_domains;
create trigger site_domains_set_updated_at
before update on site_domains
for each row execute function set_updated_at();

drop trigger if exists templates_set_updated_at on templates;
create trigger templates_set_updated_at
before update on templates
for each row execute function set_updated_at();

drop trigger if exists template_pages_set_updated_at on template_pages;
create trigger template_pages_set_updated_at
before update on template_pages
for each row execute function set_updated_at();
