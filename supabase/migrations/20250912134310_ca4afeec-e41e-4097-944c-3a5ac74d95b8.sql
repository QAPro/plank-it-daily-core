-- Additional security monitoring for admin audit log access
CREATE OR REPLACE FUNCTION public.log_admin_audit_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any access attempts to admin audit log for security monitoring
  INSERT INTO public.admin_audit_log (
    admin_user_id, 
    action_type, 
    action_details, 
    reason
  )
  VALUES (
    auth.uid(),
    'audit_log_access',
    jsonb_build_object(
      'access_time', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    'Admin audit log accessed'
  );
  
  RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to monitor admin audit log access
CREATE TRIGGER admin_audit_access_monitor
  AFTER SELECT ON public.admin_audit_log
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_admin_audit_access();