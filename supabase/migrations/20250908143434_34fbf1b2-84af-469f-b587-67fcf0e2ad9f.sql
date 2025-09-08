-- Phase C1: Database Schema Updates - Complete Ethical Transformation

-- 1. Rename database tables
ALTER TABLE investment_streaks RENAME TO progress_streaks;
ALTER TABLE user_investment_weaving RENAME TO user_progress_weaving;

-- 2. Update column names
ALTER TABLE progress_streaks RENAME COLUMN total_investment_value TO total_progress_value;
ALTER TABLE user_progress_weaving RENAME COLUMN investment_value TO progress_value;

-- 3. Update database function name and references
DROP FUNCTION IF EXISTS calculate_composite_investment_score(uuid, numeric, numeric, numeric);

CREATE OR REPLACE FUNCTION public.calculate_composite_progress_score(_user_id uuid, _social_weight numeric DEFAULT 0.33, _mastery_weight numeric DEFAULT 0.33, _status_weight numeric DEFAULT 0.34)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  social_score NUMERIC := 0;
  mastery_score NUMERIC := 0;
  status_score NUMERIC := 0;
  composite_score NUMERIC := 0;
  interdependency_bonus NUMERIC := 1.0;
BEGIN
  -- Get social progress score
  SELECT COALESCE(AVG(karma_score), 0) INTO social_score
  FROM user_reputation WHERE user_id = _user_id;
  
  -- Get mastery progress score
  SELECT COALESCE(AVG(calculate_mastery_score(technique_score, consistency_score, progression_score)), 0)
  INTO mastery_score
  FROM exercise_masteries WHERE user_id = _user_id;
  
  -- Get status/streak score
  SELECT COALESCE(MAX(current_streak * 10), 0) INTO status_score
  FROM user_streaks WHERE user_id = _user_id;
  
  -- Calculate interdependency bonus (more systems = higher value)
  IF social_score > 0 AND mastery_score > 0 AND status_score > 0 THEN
    interdependency_bonus := 1.5;
  ELSIF (social_score > 0 AND mastery_score > 0) OR 
        (social_score > 0 AND status_score > 0) OR 
        (mastery_score > 0 AND status_score > 0) THEN
    interdependency_bonus := 1.25;
  END IF;
  
  -- Calculate weighted composite score
  composite_score := (
    (social_score * _social_weight) +
    (mastery_score * _mastery_weight) +
    (status_score * _status_weight)
  ) * interdependency_bonus;
  
  RETURN ROUND(composite_score, 2);
END;
$function$;