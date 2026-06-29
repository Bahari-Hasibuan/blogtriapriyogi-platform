create table if not exists payment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_monthly int not null default 0,
  price_yearly int not null default 0,
  currency text not null default 'IDR',
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into payment_plans (name, slug, price_monthly, price_yearly, features, limits)
values
('Gratis', 'free', 0, 0, '["1 blog", "basic editor", "subdomain"]'::jsonb, '{"posts": 20, "storage_mb": 100}'::jsonb),
('Pro', 'pro', 59000, 590000, '["unlimited posts", "AI tools", "SEO center", "custom domain"]'::jsonb, '{"posts": 100000, "storage_mb": 5000}'::jsonb),
('Bisnis', 'business', 149000, 1490000, '["team access", "advanced analytics", "template builder", "priority support"]'::jsonb, '{"posts": 1000000, "storage_mb": 50000}'::jsonb),
('Enterprise', 'enterprise', 999000, 9990000, '["large scale publishing", "private support", "advanced infra"]'::jsonb, '{"posts": 1000000000, "storage_mb": 1000000}'::jsonb)
on conflict (slug) do nothing;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id uuid references payment_plans(id) on delete set null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  provider text,
  provider_subscription_id text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_number text unique,
  amount int not null default 0,
  currency text not null default 'IDR',
  status text not null default 'draft',
  due_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  provider text,
  provider_payment_id text,
  amount int not null default 0,
  currency text not null default 'IDR',
  status text not null default 'pending',
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_tenant_idx on subscriptions(tenant_id);
create index if not exists invoices_tenant_idx on invoices(tenant_id);
create index if not exists payments_tenant_idx on payments(tenant_id);
