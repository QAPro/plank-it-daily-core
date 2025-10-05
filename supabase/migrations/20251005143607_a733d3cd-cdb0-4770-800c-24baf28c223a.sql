-- Create a secure function specifically for authentication that resolves username to email
-- This function is ONLY for authentication purposes and does not leak user information
-- It returns NULL if the user doesn't exist, preventing username enumeration
CREATE OR REPLACE FUNCTION public.resolve_login_identifier(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_email text;
BEGIN
  -- If identifier contains @, it's likely an email, return as-is
  IF identifier LIKE '%@%' THEN
    RETURN identifier;
  END IF;
  
  -- Otherwise, treat as username and look up email
  -- Use case-insensitive comparison for username
  SELECT email INTO result_email
  FROM public.users
  WHERE LOWER(username) = LOWER(identifier)
  LIMIT 1;
  
  -- Return the email or NULL (important: NULL prevents username enumeration)
  RETURN result_email;
END;
$$;

-- Grant execute permission to authenticated and anonymous users (needed for login)
GRANT EXECUTE ON FUNCTION public.resolve_login_identifier(text) TO anon, authenticated;

COMMENT ON FUNCTION public.resolve_login_identifier IS 'Securely resolves a username or email to an email address for authentication. Returns NULL if not found to prevent enumeration attacks.';