
-- 1) Utility: generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW is distinct from OLD then
    NEW.updated_at := now();
  end if;
  return NEW;
end;
$$;

-- 2) Table: user_feature_overrides (used by get_user_feature_flag and Admin UI)
create table if not exists public.user_feature_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_name text not null,
  is_enabled boolean not null default false,
  reason text,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create unique index if not exists user_feature_overrides_user_feature_uidx
  on public.user_feature_overrides(user_id, feature_name);

alter table public.user_feature_overrides enable row level security;

-- RLS: Users can view their own overrides
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_feature_overrides'
      and policyname = 'Users can view own overrides'
  ) then
    create policy "Users can view own overrides"
      on public.user_feature_overrides
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- RLS: Admins can manage all overrides
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_feature_overrides'
      and policyname = 'Admins can manage overrides'
  ) then
    create policy "Admins can manage overrides"
      on public.user_feature_overrides
      for all
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end$$;

-- Trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgrelid = 'public.user_feature_overrides'::regclass
      and tgname = 'set_updated_at_user_feature_overrides'
  ) then
    create trigger set_updated_at_user_feature_overrides
      before update on public.user_feature_overrides
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- 3) Table: admin_user_notes (internal admin-only notes)
create table if not exists public.admin_user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null,
  content text not null,
  note_type text not null default 'general',
  is_important boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_user_notes enable row level security;

-- RLS: Admins can manage and view all notes
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'admin_user_notes'
      and policyname = 'Admins can manage notes'
  ) then
    create policy "Admins can manage notes"
      on public.admin_user_notes
      for all
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end$$;

-- Trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgrelid = 'public.admin_user_notes'::regclass
      and tgname = 'set_updated_at_admin_user_notes'
  ) then
    create trigger set_updated_at_admin_user_notes
      before update on public.admin_user_notes
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- 4) Table: user_segments (used by adminUserService.list/create/delete)
create table if not exists public.user_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  filter jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_segments enable row level security;

-- RLS: Admins can manage and view all segments
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_segments'
      and policyname = 'Admins can manage segments'
  ) then
    create policy "Admins can manage segments"
      on public.user_segments
      for all
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end$$;

-- Trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgrelid = 'public.user_segments'::regclass
      and tgname = 'set_updated_at_user_segments'
  ) then
    create trigger set_updated_at_user_segments
      before update on public.user_segments
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- 5) Table: user_overrides (lifetime access and similar overrides)
create table if not exists public.user_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  override_type text not null, -- e.g. 'lifetime_access'
  override_data jsonb not null default '{}'::jsonb,
  reason text,
  granted_by uuid references auth.users(id),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_overrides_user_idx on public.user_overrides(user_id);
create index if not exists user_overrides_type_idx on public.user_overrides(override_type);

alter table public.user_overrides enable row level security;

-- RLS: Users can view own overrides
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_overrides'
      and policyname = 'Users can view own overrides (user_overrides)'
  ) then
    create policy "Users can view own overrides (user_overrides)"
      on public.user_overrides
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- RLS: Admins can manage overrides
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_overrides'
      and policyname = 'Admins can manage overrides (user_overrides)'
  ) then
    create policy "Admins can manage overrides (user_overrides)"
      on public.user_overrides
      for all
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end$$;

-- Trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgrelid = 'public.user_overrides'::regclass
      and tgname = 'set_updated_at_user_overrides'
  ) then
    create trigger set_updated_at_user_overrides
      before update on public.user_overrides
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- 6) RPC: get_user_feature_overrides (used by FeatureOverridesManager)
create or replace function public.get_user_feature_overrides(_user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  feature_name text,
  is_enabled boolean,
  granted_by uuid,
  reason text,
  created_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow owner or admins
  if not (auth.uid() = _user_id or public.is_admin(auth.uid())) then
    return;
  end if;

  return query
    select 
      ufo.id,
      ufo.user_id,
      ufo.feature_name,
      ufo.is_enabled,
      ufo.granted_by,
      ufo.reason,
      ufo.created_at,
      ufo.expires_at
    from public.user_feature_overrides ufo
    where ufo.user_id = _user_id
      and (ufo.expires_at is null or ufo.expires_at > now())
    order by ufo.created_at desc;
end;
$$;

-- 7) RPC: set_user_feature_override (used by FeatureOverridesManager)
create or replace function public.set_user_feature_override(
  _user_id uuid,
  _feature_name text,
  _is_enabled boolean,
  _reason text default null,
  _expires_at timestamptz default null
)
returns public.user_feature_overrides
language plpgsql
security definer
set search_path = public
as $$
declare
  upserted public.user_feature_overrides;
begin
  -- Admins only
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can set feature overrides';
  end if;

  insert into public.user_feature_overrides as ufo
    (user_id, feature_name, is_enabled, reason, expires_at, granted_by)
  values
    (_user_id, _feature_name, _is_enabled, _reason, _expires_at, auth.uid())
  on conflict (user_id, feature_name)
  do update set
    is_enabled = excluded.is_enabled,
    reason = excluded.reason,
    expires_at = excluded.expires_at,
    granted_by = excluded.granted_by,
    updated_at = now()
  returning * into upserted;

  -- Optional: audit
  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _user_id, 'set_user_feature_override', jsonb_build_object(
    'feature_name', _feature_name,
    'is_enabled', _is_enabled
  ), _reason);

  return upserted;
end;
$$;

-- 8) RPC: grant_admin_role (used by adminUserService.grantAdminRole)
create or replace function public.grant_admin_role(_target_user_id uuid, _reason text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can grant admin role';
  end if;

  insert into public.user_roles (user_id, role)
  values (_target_user_id, 'admin'::public.app_role)
  on conflict (user_id, role) do nothing;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _target_user_id, 'grant_admin_role', '{}'::jsonb, _reason);

  return true;
end;
$$;

-- 9) RPC: revoke_admin_role (used by adminUserService.revokeAdminRole)
create or replace function public.revoke_admin_role(_target_user_id uuid, _reason text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can revoke admin role';
  end if;

  delete from public.user_roles
  where user_id = _target_user_id and role = 'admin'::public.app_role;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _target_user_id, 'revoke_admin_role', '{}'::jsonb, _reason);

  return true;
end;
$$;

-- 10) RPC: admin_change_user_tier (to replace direct UPDATE blocked by RLS)
create or replace function public.admin_change_user_tier(_target_user_id uuid, _new_tier text, _reason text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can change user tier';
  end if;

  update public.users
  set subscription_tier = _new_tier, updated_at = now()
  where id = _target_user_id;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _target_user_id, 'change_user_tier', jsonb_build_object('new_tier', _new_tier), _reason);

  return true;
end;
$$;

-- 11) RPC: admin_bulk_change_tier (used by Bulk operations)
create or replace function public.admin_bulk_change_tier(_user_ids uuid[], _new_tier text, _reason text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can bulk change user tier';
  end if;

  update public.users
  set subscription_tier = _new_tier, updated_at = now()
  where id = any(_user_ids);

  get diagnostics v_count = row_count;

  insert into public.admin_audit_log (admin_user_id, action_type, affected_count, action_details, reason)
  values (auth.uid(), 'bulk_change_user_tier', v_count, jsonb_build_object('new_tier', _new_tier), _reason);

  return v_count;
end;
$$;

-- 12) RPCs: Lifetime overrides (admin oriented)
create or replace function public.get_user_lifetime_overrides(_user_id uuid)
returns setof public.user_overrides
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (auth.uid() = _user_id or public.is_admin(auth.uid())) then
    return;
  end if;

  return query
    select * from public.user_overrides
    where user_id = _user_id and override_type = 'lifetime_access'
    order by created_at desc;
end;
$$;

create or replace function public.admin_grant_lifetime_access(
  _user_id uuid,
  _reason text default null,
  _override_data jsonb default '{}'::jsonb,
  _expires_at timestamptz default null
)
returns public.user_overrides
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted public.user_overrides;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can grant lifetime access';
  end if;

  insert into public.user_overrides (user_id, override_type, override_data, reason, granted_by, is_active, expires_at)
  values (_user_id, 'lifetime_access', _override_data, _reason, auth.uid(), true, _expires_at)
  returning * into inserted;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _user_id, 'grant_lifetime_access', _override_data, _reason);

  return inserted;
end;
$$;

create or replace function public.admin_revoke_lifetime_access(
  _override_id uuid,
  _reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_count integer;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can revoke lifetime access';
  end if;

  select user_id into v_user_id from public.user_overrides where id = _override_id;

  update public.user_overrides
  set is_active = false, updated_at = now()
  where id = _override_id;

  get diagnostics v_count = row_count;

  if v_user_id is not null then
    insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
    values (auth.uid(), v_user_id, 'revoke_lifetime_access', jsonb_build_object('override_id', _override_id), _reason);
  end if;

  return v_count > 0;
end;
$$;
