-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.calculate_mastery_score(
  technique_score NUMERIC,
  consistency_score NUMERIC, 
  progression_score NUMERIC
) RETURNS NUMERIC 
LANGUAGE plpgsql 
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ROUND(
    (technique_score * 0.4 + consistency_score * 0.3 + progression_score * 0.3)::NUMERIC, 
    2
  );
END;
$$;

-- Fix update mastery level function
CREATE OR REPLACE FUNCTION public.update_mastery_level()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overall_score NUMERIC;
  new_level INTEGER;
BEGIN
  overall_score := public.calculate_mastery_score(
    NEW.technique_score, 
    NEW.consistency_score, 
    NEW.progression_score
  );
  
  -- Determine mastery level based on overall score
  IF overall_score >= 95 THEN new_level := 10;
  ELSIF overall_score >= 90 THEN new_level := 9;
  ELSIF overall_score >= 85 THEN new_level := 8;
  ELSIF overall_score >= 80 THEN new_level := 7;
  ELSIF overall_score >= 75 THEN new_level := 6;
  ELSIF overall_score >= 70 THEN new_level := 5;
  ELSIF overall_score >= 60 THEN new_level := 4;
  ELSIF overall_score >= 50 THEN new_level := 3;
  ELSIF overall_score >= 30 THEN new_level := 2;
  ELSE new_level := 1;
  END IF;
  
  -- Update mastery level if it increased
  IF new_level > OLD.mastery_level THEN
    NEW.mastery_level := new_level;
    NEW.mastery_unlocked_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;