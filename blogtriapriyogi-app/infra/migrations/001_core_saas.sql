create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  legal_name text,
  logo_url text,
  favicon_url text,
  website_url text,
  default_domain text,
  plan_key text not null default 'free',
  status text not null default 'active',
  timezone text not null default 'Asia/Jakarta',
  locale text not null default 'id-ID',
  currency text not null default 'IDR',
  primary_color text not null default '#7c3aed',
  metadata jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tenants_status_check check (
    status in ('active', 'inactive', 'suspended', 'deleted')
  ),

  constraint tenants_plan_key_check check (
    plan_key in ('free', 'starter', 'pro', 'business', 'enterprise')
  )
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email citext unique,
  username citext unique,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  phone text,
  country text,
  city text,
  language text not null default 'id',
  timezone text not null default 'Asia/Jakarta',
  status text not null default 'active',
  last_login_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_status_check check (
    status in ('active', 'inactive', 'blocked', 'deleted')
  )
);

create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role_key text not null default 'owner',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  invited_by uuid references profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,

  unique (tenant_id, profile_id),

  constraint tenant_members_role_check check (
    role_key in ('owner', 'admin', 'editor', 'writer', 'seo', 'analyst', 'billing', 'viewer')
  ),

  constraint tenant_members_status_check check (
    status in ('active', 'invited', 'disabled', 'removed')
  )
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  name text not null,
  group_key text not null,
  description text,
  created_at timestamptz not null default now()
);

insert into permissions (permission_key, name, group_key, description)
values
('tenant.read', 'Read Workspace', 'tenant', 'Melihat data workspace'),
('tenant.update', 'Update Workspace', 'tenant', 'Mengubah data workspace'),
('member.read', 'Read Members', 'member', 'Melihat anggota'),
('member.manage', 'Manage Members', 'member', 'Mengelola anggota dan role'),
('post.read', 'Read Posts', 'post', 'Melihat post'),
('post.create', 'Create Posts', 'post', 'Membuat post'),
('post.update', 'Update Posts', 'post', 'Mengubah post'),
('post.delete', 'Delete Posts', 'post', 'Menghapus post'),
('post.publish', 'Publish Posts', 'post', 'Publikasi post'),
('media.read', 'Read Media', 'media', 'Melihat media'),
('media.upload', 'Upload Media', 'media', 'Upload media'),
('media.delete', 'Delete Media', 'media', 'Menghapus media'),
('domain.read', 'Read Domains', 'domain', 'Melihat domain'),
('domain.manage', 'Manage Domains', 'domain', 'Mengelola domain'),
('analytics.read', 'Read Analytics', 'analytics', 'Melihat analytics'),
('template.read', 'Read Templates', 'template', 'Melihat template'),
('template.manage', 'Manage Templates', 'template', 'Mengelola template'),
('seo.manage', 'Manage SEO', 'seo', 'Mengelola SEO'),
('ai.use', 'Use AI Tools', 'ai', 'Menggunakan AI tools'),
('payment.read', 'Read Billing', 'payment', 'Melihat billing'),
('payment.manage', 'Manage Billing', 'payment', 'Mengelola pembayaran'),
('admin.full', 'Full Admin', 'admin', 'Akses penuh admin')
on conflict (permission_key) do nothing;

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  level int not null default 1,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

insert into roles (role_key, name, level, description, is_system)
values
('owner', 'Owner', 100, 'Pemilik workspace dengan akses penuh', true),
('admin', 'Admin', 90, 'Admin operasional workspace', true),
('editor', 'Editor', 70, 'Mengelola konten dan publikasi', true),
('writer', 'Writer', 50, 'Menulis dan mengedit draft artikel', true),
('seo', 'SEO Manager', 45, 'Mengelola SEO dan optimasi konten', true),
('analyst', 'Analyst', 40, 'Melihat data analytics', true),
('billing', 'Billing Manager', 35, 'Mengelola paket dan pembayaran', true),
('viewer', 'Viewer', 10, 'Akses baca saja', true)
on conflict (role_key) do nothing;

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_key text not null references roles(role_key) on delete cascade,
  permission_key text not null references permissions(permission_key) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_key, permission_key)
);

insert into role_permissions (role_key, permission_key)
select 'owner', permission_key from permissions
on conflict do nothing;

insert into role_permissions (role_key, permission_key)
values
('admin', 'tenant.read'),
('admin', 'tenant.update'),
('admin', 'member.read'),
('admin', 'member.manage'),
('admin', 'post.read'),
('admin', 'post.create'),
('admin', 'post.update'),
('admin', 'post.delete'),
('admin', 'post.publish'),
('admin', 'media.read'),
('admin', 'media.upload'),
('admin', 'media.delete'),
('admin', 'domain.read'),
('admin', 'domain.manage'),
('admin', 'analytics.read'),
('admin', 'template.read'),
('admin', 'template.manage'),
('admin', 'seo.manage'),
('admin', 'ai.use'),
('admin', 'payment.read'),

('editor', 'post.read'),
('editor', 'post.create'),
('editor', 'post.update'),
('editor', 'post.delete'),
('editor', 'post.publish'),
('editor', 'media.read'),
('editor', 'media.upload'),
('editor', 'seo.manage'),
('editor', 'ai.use'),

('writer', 'post.read'),
('writer', 'post.create'),
('writer', 'post.update'),
('writer', 'media.read'),
('writer', 'media.upload'),
('writer', 'ai.use'),

('seo', 'post.read'),
('seo', 'post.update'),
('seo', 'seo.manage'),
('seo', 'analytics.read'),
('seo', 'ai.use'),

('analyst', 'analytics.read'),
('analyst', 'post.read'),

('billing', 'payment.read'),
('billing', 'payment.manage'),

('viewer', 'tenant.read'),
('viewer', 'post.read'),
('viewer', 'media.read'),
('viewer', 'analytics.read')
on conflict do nothing;

create table if not exists tenant_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email citext not null,
  role_key text not null references roles(role_key),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending',
  invited_by uuid references profiles(id) on delete set null,
  accepted_by uuid references profiles(id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),

  constraint tenant_invitations_status_check check (
    status in ('pending', 'accepted', 'expired', 'revoked')
  )
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  scopes text[] not null default '{}',
  status text not null default 'active',
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint api_keys_status_check check (
    status in ('active', 'disabled', 'revoked', 'expired')
  )
);

create table if not exists sessions_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  ip_hash text,
  user_agent text,
  device text,
  browser text,
  country text,
  city text,
  login_at timestamptz not null default now(),
  logout_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  severity text not null default 'info',
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint activity_logs_severity_check check (
    severity in ('debug', 'info', 'warning', 'error', 'critical')
  )
);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  flag_key text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, flag_key)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tenants_updated_at on tenants;
create trigger trg_tenants_updated_at
before update on tenants
for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists trg_feature_flags_updated_at on feature_flags;
create trigger trg_feature_flags_updated_at
before update on feature_flags
for each row execute function set_updated_at();

create index if not exists idx_tenants_slug on tenants(slug);
create index if not exists idx_tenants_status on tenants(status);
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_auth_user_id on profiles(auth_user_id);
create index if not exists idx_tenant_members_tenant_id on tenant_members(tenant_id);
create index if not exists idx_tenant_members_profile_id on tenant_members(profile_id);
create index if not exists idx_tenant_members_role_key on tenant_members(role_key);
create index if not exists idx_activity_logs_tenant_time on activity_logs(tenant_id, created_at desc);
create index if not exists idx_sessions_log_profile_time on sessions_log(profile_id, login_at desc);
create index if not exists idx_api_keys_tenant_id on api_keys(tenant_id);

insert into tenants (name, slug, plan_key, status, default_domain)
values ('TriApriyogi Studio', 'triapriyogi', 'pro', 'active', 'studio.triapriyogi.com')
on conflict (slug) do update
set
  name = excluded.name,
  plan_key = excluded.plan_key,
  status = excluded.status,
  default_domain = excluded.default_domain,
  updated_at = now();

create or replace view v_core_saas_overview as
select
  (select count(*) from tenants) as tenants_count,
  (select count(*) from profiles) as profiles_count,
  (select count(*) from tenant_members) as tenant_members_count,
  (select count(*) from roles) as roles_count,
  (select count(*) from permissions) as permissions_count,
  (select count(*) from role_permissions) as role_permissions_count,
  (select count(*) from api_keys) as api_keys_count,
  (select count(*) from tenant_invitations) as invitations_count,
  (select count(*) from activity_logs) as activity_logs_count;

