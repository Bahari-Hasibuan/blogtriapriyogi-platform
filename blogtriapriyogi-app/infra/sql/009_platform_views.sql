create or replace view platform_admin_overview as
select
  (select count(*) from tenants) as tenants_count,
  (select count(*) from profiles) as profiles_count,
  (select count(*) from posts) as posts_count,
  (select count(*) from media_assets) as media_count,
  (select count(*) from site_domains) as domains_count,
  (select count(*) from templates) as templates_count,
  (select count(*) from payments) as payments_count,
  (select count(*) from worker_jobs where status in ('queued', 'retry')) as queued_jobs_count,
  (select count(*) from worker_jobs where status = 'failed') as failed_jobs_count;

create or replace view tenant_usage_overview as
select
  t.id as tenant_id,
  t.slug,
  t.name,
  t.plan_code,
  count(distinct p.id) as posts_count,
  count(distinct m.id) as media_count,
  count(distinct d.id) as domains_count,
  count(distinct tm.id) as members_count
from tenants t
left join posts p on p.tenant_id = t.id and p.status <> 'deleted'
left join media_assets m on m.tenant_id = t.id and m.status <> 'deleted'
left join site_domains d on d.tenant_id = t.id
left join tenant_members tm on tm.tenant_id = t.id
group by t.id, t.slug, t.name, t.plan_code;
