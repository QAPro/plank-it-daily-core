-- Simplify admin hierarchy: Make admin the highest level (4) with full permissions

-- Update get_user_role_level to treat admin as level 4 (highest)
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(_user_id, 'admin') THEN
    RETURN 4; -- Admin is now the highest level
  ELSIF public.has_role(_user_id, 'moderator') THEN
    RETURN 3;
  ELSIF public.has_role(_user_id, 'subscriber') THEN
    RETURN 2;
  ELSE
    RETURN 1; -- user
  END IF;
END;
$function$;

-- Update can_modify_user_roles to allow admins to modify other admins
CREATE OR REPLACE FUNCTION public.can_modify_user_roles(_admin_id uuid, _target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_level INTEGER;
  target_level INTEGER;
BEGIN
  admin_level := public.get_user_role_level(_admin_id);
  target_level := public.get_user_role_level(_target_user_id);

  -- Only admins (level 4) can modify roles
  IF admin_level < 4 THEN
    RETURN FALSE;
  END IF;

  -- Admins can modify anyone (including other admins)
  IF admin_level = 4 THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$function$;

-- Update is_superadmin to simply check for admin role
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user_id, 'admin'::app_role);
$function$;

-- Update assign_role to allow admins to assign any role
CREATE OR REPLACE FUNCTION public.assign_role(_target_user_id uuid, _role app_role, _reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor UUID := auth.uid();
BEGIN
  -- Only admins can change roles
  IF public.get_user_role_level(actor) < 4 THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  -- Admins can assign any role (including admin role to others)
  IF NOT public.is_admin(actor) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
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
$function$;

-- Update grant_admin_role to work with simplified hierarchy
CREATE OR REPLACE FUNCTION public.grant_admin_role(_target_user_id uuid, _reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Convert any existing superadmin roles to admin roles
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE role = 'superadmin'::app_role;