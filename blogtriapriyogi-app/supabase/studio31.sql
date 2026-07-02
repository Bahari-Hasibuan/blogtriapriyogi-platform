create table if not exists public.studio_sites (
  slug text primary key,
  custom_domain text unique,
  site jsonb not null,
  updated_at timestamptz default now()
);

alter table public.studio_sites enable row level security;

drop policy if exists "public read studio sites" on public.studio_sites;
create policy "public read studio sites"
on public.studio_sites
for select
using (true);

drop policy if exists "public insert studio sites" on public.studio_sites;
create policy "public insert studio sites"
on public.studio_sites
for insert
with check (true);

drop policy if exists "public update studio sites" on public.studio_sites;
create policy "public update studio sites"
on public.studio_sites
for update
using (true)
with check (true);
