create or replace view platform_admin_overview as
select
  (select count(*) from tenants) as tenants_count,
  (select count(*) from profiles) as profiles_count,
  (select count(*) from user_roles) as user_roles_count,
  (select count(*) from posts) as posts_count,
  (select count(*) from post_contents) as post_contents_count,
  (select count(*) from media_assets) as media_count,
  (select count(*) from domains) as domains_count,
  (select count(*) from analytics_events) as analytics_events_count,
  (select count(*) from analytics_daily) as analytics_daily_count,
  (select count(*) from templates) as templates_count,
  (select count(*) from payments) as payments_count,
  (select count(*) from ai_tool_logs) as ai_logs_count,
  (select count(*) from seo_audits) as seo_audits_count,
  (select count(*) from admin_audit_logs) as admin_logs_count;
