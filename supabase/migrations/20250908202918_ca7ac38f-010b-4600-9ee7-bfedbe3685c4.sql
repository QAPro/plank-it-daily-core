-- Phase 1B: Functions for Role Management and Permissions (no enum changes)

-- Helper: superadmin check
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin');
$$;

-- Role hierarchy level
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(_user_id, 'superadmin') THEN
    RETURN 5;
  ELSIF public.has_role(_user_id, 'admin') THEN
    RETURN 4;
  ELSIF public.has_role(_user_id, 'moderator') THEN
    RETURN 3;
  ELSIF public.has_role(_user_id, 'subscriber') THEN
    RETURN 2;
  ELSE
    RETURN 1; -- user
  END IF;
END;
$$;

-- Can current admin modify target user roles?
CREATE OR REPLACE FUNCTION public.can_modify_user_roles(_admin_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  admin_level INTEGER;
  target_level INTEGER;
BEGIN
  admin_level := public.get_user_role_level(_admin_id);
  target_level := public.get_user_role_level(_target_user_id);

  -- Only admins (level >= 4) can modify roles
  IF admin_level < 4 THEN
    RETURN FALSE;
  END IF;

  -- Superadmins can modify anyone
  IF admin_level = 5 THEN
    RETURN TRUE;
  END IF;

  -- Admins can modify users below their level only
  IF admin_level > target_level THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Unified list of user roles (administrative + special app_role types)
CREATE OR REPLACE FUNCTION public.get_all_user_roles(_user_id UUID)
RETURNS TABLE(
  role_type TEXT,
  role_name TEXT,
  granted_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
)
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = public  
AS $$
BEGIN
  -- Only allow admins or the user themselves to query
  IF NOT (auth.uid() = _user_id OR public.is_admin(auth.uid())) THEN
    RETURN;
  END IF;

  -- Return administrative roles
  RETURN QUERY
  SELECT
    'administrative'::TEXT as role_type,
    ur.role::TEXT as role_name,
    ur.created_at as granted_at,
    NULL::UUID as granted_by,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at,
    TRUE as is_active
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id;

  -- Return special permissions table if present
  IF to_regclass('public.special_permissions') IS NOT NULL THEN
    RETURN QUERY  
    SELECT
      'special'::TEXT as role_type,
      sp.permission_type as role_name,
      sp.created_at as granted_at,
      sp.granted_by,
      sp.expires_at,
      sp.is_active
    FROM public.special_permissions sp
    WHERE sp.user_id = _user_id
      AND (sp.expires_at IS NULL OR sp.expires_at > now())
      AND sp.is_active = true;
  END IF;
END;
$$;

-- Assign a role with strict security
CREATE OR REPLACE FUNCTION public.assign_role(_target_user_id UUID, _role public.app_role, _reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor UUID := auth.uid();
BEGIN
  -- Only admins/superadmins can change roles
  IF public.get_user_role_level(actor) < 4 THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  -- Only superadmins can assign admin or superadmin roles
  IF _role IN ('admin', 'superadmin') AND NOT public.is_superadmin(actor) THEN
    RAISE EXCEPTION 'Only superadmins can assign admin or superadmin roles';
  END IF;

  -- Cannot modify peers or higher
  IF NOT public.can_modify_user_roles(actor, _target_user_id) THEN
    RAISE EXCEPTION 'Insufficient privileges to modify target user roles';
  END IF;

  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Audit
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  VALUES (actor, _target_user_id, 'assign_role', jsonb_build_object('role', _role), _reason);

  RETURN TRUE;
END;
$$;

-- Revoke a role with strict security
CREATE OR REPLACE FUNCTION public.revoke_role(_target_user_id UUID, _role public.app_role, _reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor UUID := auth.uid();
BEGIN
  -- Only admins/superadmins can change roles
  IF public.get_user_role_level(actor) < 4 THEN
    RAISE EXCEPTION 'Only admins can revoke roles';
  END IF;

  -- Only superadmins can revoke admin or superadmin roles
  IF _role IN ('admin', 'superadmin') AND NOT public.is_superadmin(actor) THEN
    RAISE EXCEPTION 'Only superadmins can revoke admin or superadmin roles';
  END IF;

  -- Cannot modify peers or higher
  IF NOT public.can_modify_user_roles(actor, _target_user_id) THEN
    RAISE EXCEPTION 'Insufficient privileges to modify target user roles';
  END IF;

  -- Delete role
  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id AND role = _role;

  -- Audit
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  VALUES (actor, _target_user_id, 'revoke_role', jsonb_build_object('role', _role), _reason);

  RETURN FOUND;
END;
$$;

-- Tighten existing admin grant/revoke to superadmin-only
CREATE OR REPLACE FUNCTION public.grant_admin_role(_target_user_id uuid, _reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  if not public.is_superadmin(auth.uid()) then
    raise exception 'Only superadmins can grant admin role';
  end if;

  insert into public.user_roles (user_id, role)
  values (_target_user_id, 'admin'::public.app_role)
  on conflict (user_id, role) do nothing;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _target_user_id, 'grant_admin_role', '{}'::jsonb, _reason);

  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_admin_role(_target_user_id uuid, _reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  if not public.is_superadmin(auth.uid()) then
    raise exception 'Only superadmins can revoke admin role';
  end if;

  delete from public.user_roles
  where user_id = _target_user_id and role = 'admin'::public.app_role;

  insert into public.admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
  values (auth.uid(), _target_user_id, 'revoke_admin_role', '{}'::jsonb, _reason);

  return true;
end;
$function$;