create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  title text not null default 'Untitled',
  slug text not null default 'artikel-baru',
  excerpt text,
  content text,
  status text not null default 'draft',
  seo_title text,
  seo_description text,
  cover_image text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  domain text not null unique,
  type text not null default 'custom',
  status text not null default 'pending',
  verification_token text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  path text,
  referrer text,
  user_agent text,
  country text,
  created_at timestamptz not null default now()
);

insert into tenants (name, slug)
values ('Vlog Blog', 'vlog-blog')
on conflict (slug) do nothing;

update posts
set tenant_id = (select id from tenants where slug = 'vlog-blog' limit 1)
where tenant_id is null;
