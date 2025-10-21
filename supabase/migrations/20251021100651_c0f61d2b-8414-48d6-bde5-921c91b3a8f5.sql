-- Phase 4B: Clean Slate Migration
-- Clear all user achievements from old system to allow re-earning with new UUID-based system

-- Store count before deletion for audit log
DO $$
DECLARE
  achievement_count INTEGER;
BEGIN
  -- Get count
  SELECT COUNT(*) INTO achievement_count FROM user_achievements;
  
  -- Clear all user achievements
  DELETE FROM user_achievements;
  
  -- Log the migration
  INSERT INTO admin_audit_log (action_type, reason, affected_count, action_details)
  VALUES (
    'data_migration',
    'Phase 4B: Cleared old achievement data to migrate to UUID-based system',
    achievement_count,
    jsonb_build_object(
      'achievements_deleted', achievement_count,
      'migration_phase', '4B',
      'timestamp', NOW(),
      'reason', 'Old achievement_type values (exploration, milestone, etc.) do not match new UUID-based achievement IDs'
    )
  );
END $$;