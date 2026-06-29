create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  file_name text not null,
  original_name text,
  mime_type text,
  file_size bigint default 0,
  storage_bucket text default 'media',
  storage_path text,
  public_url text not null,
  alt_text text,
  caption text,
  width int,
  height int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists media_assets_tenant_created_idx
on public.media_assets(tenant_id, created_at desc);

create table if not exists public.post_seo (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  meta_title text,
  meta_description text,
  canonical_url text,
  robots text not null default 'index,follow',
  schema_json jsonb not null default '{}'::jsonb,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id)
);

create index if not exists post_seo_tenant_idx
on public.post_seo(tenant_id);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  domain text not null,
  domain_type text not null default 'custom',
  status text not null default 'pending',
  verification_token text not null default encode(gen_random_bytes(16), 'hex'),
  dns_target text default 'cname.vercel-dns.com',
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists domains_domain_unique_idx
on public.domains(lower(domain));

create index if not exists domains_tenant_status_idx
on public.domains(tenant_id, status);

create table if not exists public.analytics_events (
  id bigserial primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  domain_id uuid references public.domains(id) on delete set null,
  event_name text not null default 'page_view',
  pathname text,
  referrer text,
  country text,
  device text,
  browser text,
  os text,
  session_id text,
  visitor_id text,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_tenant_time_idx
on public.analytics_events(tenant_id, occurred_at desc);

create index if not exists analytics_events_post_time_idx
on public.analytics_events(post_id, occurred_at desc);

create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  template_type text not null default 'page',
  layout_json jsonb not null default '{}'::jsonb,
  theme_json jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_monthly numeric(12,2) not null default 0,
  price_yearly numeric(12,2) not null default 0,
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  provider text,
  provider_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  invoice_number text,
  status text not null default 'draft',
  amount numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  due_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  permission text not null,
  created_at timestamptz not null default now(),
  unique(role, permission)
);

insert into public.plans (code, name, price_monthly, price_yearly, limits, features)
values
('free', 'Free', 0, 0, '{"posts":50,"media_gb":1,"domains":1}', '{"editor":true,"seo":true}'),
('pro', 'Pro', 99000, 990000, '{"posts":10000,"media_gb":50,"domains":10}', '{"editor":true,"seo":true,"analytics":true,"custom_domain":true}'),
('business', 'Business', 299000, 2990000, '{"posts":1000000,"media_gb":500,"domains":100}', '{"editor":true,"seo":true,"analytics":true,"custom_domain":true,"team":true,"api":true}')
on conflict (code) do nothing;

insert into public.admin_role_permissions (role, permission)
values
('owner', '*'),
('admin', 'content.*'),
('admin', 'media.*'),
('admin', 'seo.*'),
('admin', 'domain.*'),
('admin', 'analytics.read'),
('admin', 'template.*'),
('admin', 'payment.read'),
('admin', 'role.manage'),
('editor', 'content.*'),
('editor', 'media.*'),
('editor', 'seo.*'),
('writer', 'content.create'),
('writer', 'content.update_own'),
('viewer', 'content.read'),
('viewer', 'analytics.read')
on conflict do nothing;

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists post_seo_set_updated_at on public.post_seo;
create trigger post_seo_set_updated_at
before update on public.post_seo
for each row execute function public.set_updated_at();

drop trigger if exists domains_set_updated_at on public.domains;
create trigger domains_set_updated_at
before update on public.domains
for each row execute function public.set_updated_at();

drop trigger if exists content_templates_set_updated_at on public.content_templates;
create trigger content_templates_set_updated_at
before update on public.content_templates
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();
