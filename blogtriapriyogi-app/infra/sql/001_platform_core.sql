create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_status') then
    create type tenant_status as enum ('active', 'trial', 'suspended', 'deleted');
  end if;

  if not exists (select 1 from pg_type where typname = 'tenant_role') then
    create type tenant_role as enum ('owner', 'admin', 'editor', 'author', 'viewer', 'billing');
  end if;

  if not exists (select 1 from pg_type where typname = 'global_role') then
    create type global_role as enum ('super_admin', 'support', 'user');
  end if;
end $$;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  full_name text,
  avatar_url text,
  global_role global_role not null default 'user',
  metadata jsonb not null default '{}',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  status tenant_status not null default 'trial',
  plan_code text not null default 'free',
  owner_profile_id uuid references profiles(id) on delete set null,
  locale text not null default 'id-ID',
  timezone text not null default 'Asia/Jakarta',
  settings jsonb not null default '{}',
  feature_flags jsonb not null default '{}',
  limits jsonb not null default '{
    "posts": 1000,
    "media_mb": 1024,
    "members": 5,
    "domains": 3,
    "ai_tokens_month": 100000
  }',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role tenant_role not null default 'viewer',
  status text not null default 'active',
  permissions jsonb not null default '{}',
  invited_by uuid references profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, profile_id)
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  key_hash text not null,
  scopes jsonb not null default '[]',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_global_role on profiles(global_role);
create index if not exists idx_tenants_status on tenants(status);
create index if not exists idx_tenants_plan_code on tenants(plan_code);
create index if not exists idx_tenant_members_tenant_role on tenant_members(tenant_id, role);
create index if not exists idx_tenant_members_profile on tenant_members(profile_id);
create index if not exists idx_api_keys_tenant on api_keys(tenant_id);

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists tenants_set_updated_at on tenants;
create trigger tenants_set_updated_at
before update on tenants
for each row execute function set_updated_at();

drop trigger if exists tenant_members_set_updated_at on tenant_members;
create trigger tenant_members_set_updated_at
before update on tenant_members
for each row execute function set_updated_at();
