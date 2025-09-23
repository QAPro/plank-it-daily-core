-- Fix the security warning by updating the function that's missing search_path
CREATE OR REPLACE FUNCTION public.update_leadership_candidates_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;