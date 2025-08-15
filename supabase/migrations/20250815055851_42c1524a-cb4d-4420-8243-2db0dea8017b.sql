
-- Update RLS policy for challenge_participants to be more restrictive
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view challenge participants" ON challenge_participants;

-- Create a more restrictive policy that only allows users to see participants of challenges they've joined
CREATE POLICY "Users can view participants of joined challenges" ON challenge_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM challenge_participants cp 
    WHERE cp.challenge_id = challenge_participants.challenge_id 
    AND cp.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM community_challenges cc 
    WHERE cc.id = challenge_participants.challenge_id 
    AND cc.created_by = auth.uid()
  )
);
