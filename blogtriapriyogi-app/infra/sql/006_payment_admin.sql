create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  price_monthly numeric(12,2) not null default 0,
  price_yearly numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  features jsonb not null default '{}',
  limits jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id uuid references plans(id) on delete set null,
  status text not null default 'trialing',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_number text,
  status text not null default 'draft',
  amount_subtotal numeric(12,2) not null default 0,
  amount_tax numeric(12,2) not null default 0,
  amount_total numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  due_at timestamptz,
  paid_at timestamptz,
  provider_invoice_id text,
  invoice_url text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  provider text not null default 'manual',
  provider_payment_id text,
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  paid_at timestamptz,
  raw_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  provider_event_id text,
  payload jsonb not null default '{}',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

insert into plans (code, name, price_monthly, price_yearly, features, limits)
values
  ('free', 'Free', 0, 0, '{"editor":true,"ai":false}', '{"posts":100,"media_mb":256,"members":1}'),
  ('pro', 'Pro', 59000, 590000, '{"editor":true,"ai":true,"custom_domain":true}', '{"posts":10000,"media_mb":10240,"members":10}'),
  ('business', 'Business', 149000, 1490000, '{"editor":true,"ai":true,"custom_domain":true,"team":true}', '{"posts":100000,"media_mb":102400,"members":100}')
on conflict (code) do update set
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  features = excluded.features,
  limits = excluded.limits,
  updated_at = now();

create index if not exists idx_subscriptions_tenant on subscriptions(tenant_id);
create index if not exists idx_invoices_tenant_status on invoices(tenant_id, status);
create index if not exists idx_payments_tenant_status on payments(tenant_id, status);
create index if not exists idx_admin_audit_tenant_time on admin_audit_logs(tenant_id, created_at desc);
create index if not exists idx_security_events_tenant_time on security_events(tenant_id, created_at desc);

drop trigger if exists plans_set_updated_at on plans;
create trigger plans_set_updated_at
before update on plans
for each row execute function set_updated_at();

drop trigger if exists subscriptions_set_updated_at on subscriptions;
create trigger subscriptions_set_updated_at
before update on subscriptions
for each row execute function set_updated_at();
