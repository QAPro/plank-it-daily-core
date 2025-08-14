
-- Create RPC function to increment challenge participant count
CREATE OR REPLACE FUNCTION increment_challenge_participants(challenge_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE community_challenges 
  SET participant_count = participant_count + 1,
      updated_at = now()
  WHERE id = challenge_id;
END;
$$;
