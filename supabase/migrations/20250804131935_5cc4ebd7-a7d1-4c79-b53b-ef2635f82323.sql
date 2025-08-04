
-- First, let's check and fix the foreign key constraint issue on the users table
-- We need to identify and remove any circular self-referencing constraints

-- Drop any problematic foreign key constraints on the users table
-- (This will allow user deletion to work properly)
DO $$
BEGIN
    -- Check if there's a self-referencing foreign key and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
    END IF;
END $$;

-- Ensure the users table has proper structure without circular references
-- The users table should only reference auth.users, not itself
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add proper foreign key constraint to auth.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey_auth' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_id_fkey_auth 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;
