create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Personal',
  slug text not null unique,
  plan text not null default 'free',
  status text not null default 'active',
  owner_id uuid,
  logo_url text,
  favicon_url text,
  primary_color text default '#7c3aed',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  tenant_id uuid references tenants(id) on delete set null,
  full_name text,
  email text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  level int not null default 1,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role_key text not null references admin_roles(role_key),
  created_at timestamptz not null default now(),
  unique (tenant_id, profile_id, role_key)
);

insert into tenants (name, slug, plan, status)
values ('TriApriyogi Studio', 'triapriyogi', 'pro', 'active')
on conflict (slug) do nothing;

insert into admin_roles (role_key, name, level, permissions)
values
('superadmin', 'Super Admin', 999, '{"all": true}'::jsonb),
('owner', 'Owner', 100, '{"all": true}'::jsonb),
('admin', 'Admin', 80, '{"manage": true}'::jsonb),
('editor', 'Editor', 50, '{"posts": true, "media": true, "seo": true}'::jsonb),
('writer', 'Writer', 30, '{"posts": true}'::jsonb),
('viewer', 'Viewer', 10, '{"read": true}'::jsonb)
on conflict (role_key) do nothing;

drop trigger if exists tenants_set_updated_at on tenants;
create trigger tenants_set_updated_at
before update on tenants
for each row execute function set_updated_at();

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();
