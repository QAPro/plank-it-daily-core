
-- 1) Fix recursive RLS policy on challenge_participants by using a SECURITY DEFINER helper

create or replace function public.is_participant_in_challenge(
  _challenge_id uuid,
  _user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select exists (
    select 1
    from public.challenge_participants cp
    where cp.challenge_id = _challenge_id
      and cp.user_id = _user_id
  );
$$;

-- Update existing SELECT policy to avoid self-referencing the table
alter policy "Users can view participants of joined challenges"
  on public.challenge_participants
  using (
    public.is_participant_in_challenge(challenge_participants.challenge_id, auth.uid())
    or exists (
      select 1
      from public.community_challenges cc
      where cc.id = challenge_participants.challenge_id
        and cc.created_by = auth.uid()
    )
  );

-- 2) Enforce fixed search_path on all functions missing it (idempotent)

do $$
declare 
  r record;
begin
  for r in
    select 
      n.nspname as schema_name,
      p.proname as function_name,
      oidvectortypes(p.proargtypes) as argtypes
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (
        p.proconfig is null
        or not exists (
          select 1 from unnest(p.proconfig) as cfg where cfg ilike 'search_path=%'
        )
      )
  loop
    execute format(
      'alter function %I.%I(%s) set search_path to public;',
      r.schema_name, r.function_name, r.argtypes
    );
  end loop;
end;
$$;

-- 3) Lock down materialized views so they are not directly accessible via the API

do $$
begin
  if exists (select 1 from pg_matviews where schemaname='public' and matviewname='user_engagement_metrics') then
    revoke all on materialized view public.user_engagement_metrics from public, anon, authenticated;
  end if;

  if exists (select 1 from pg_matviews where schemaname='public' and matviewname='subscription_analytics') then
    revoke all on materialized view public.subscription_analytics from public, anon, authenticated;
  end if;
end;
$$;
