do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'user_id'
  ) then
    execute 'alter table public.posts alter column user_id drop not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'author_id'
  ) then
    execute 'alter table public.posts alter column author_id drop not null';
  end if;
end $$;
