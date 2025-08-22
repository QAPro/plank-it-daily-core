
-- Secure admin RPC to list user IDs by engagement status without exposing the MV
create or replace function public.admin_get_user_ids_by_engagement_status(_status text)
returns table(user_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can access engagement status lists';
  end if;

  return query
  select uem.user_id
  from public.user_engagement_metrics uem
  where (_status is null or uem.engagement_status = _status);
end;
$$;

revoke all on function public.admin_get_user_ids_by_engagement_status(text) from public;
grant execute on function public.admin_get_user_ids_by_engagement_status(text) to anon, authenticated;


-- Secure per-user RPC to fetch a single engagement metrics row
-- Allows the owner or an admin; returns zero or one row.
create or replace function public.get_user_engagement_metrics_row(target_user_id uuid)
returns setof public.user_engagement_metrics
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not (auth.uid() = target_user_id or public.is_admin(auth.uid())) then
    return;
  end if;

  return query
  select *
  from public.user_engagement_metrics uem
  where uem.user_id = target_user_id
  limit 1;
end;
$$;

revoke all on function public.get_user_engagement_metrics_row(uuid) from public;
grant execute on function public.get_user_engagement_metrics_row(uuid) to anon, authenticated;


-- Secure admin RPC to read subscription analytics MV without exposing it directly
create or replace function public.admin_get_subscription_analytics()
returns setof public.subscription_analytics
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can access subscription analytics';
  end if;

  return query
  select *
  from public.subscription_analytics;
end;
$$;

revoke all on function public.admin_get_subscription_analytics() from public;
grant execute on function public.admin_get_subscription_analytics() to anon, authenticated;
