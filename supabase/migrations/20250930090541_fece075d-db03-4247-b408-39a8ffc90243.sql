-- Update Exercise Family Display Names and Reorder Alphabetically
-- This migration reorganizes exercise families to:
-- 1. Move difficulty indicators AFTER the exercise name (e.g., "Planking - Basic")
-- 2. Sort top-level categories alphabetically (Cardio first, then Leg Lifts, Planking, etc.)
-- 3. Keep difficulty-based subcategories ordered (Basic before Advanced)
-- 4. Maintain descriptive "Seated" and "Standing" prefixes

-- Update family names: Move difficulty indicators after exercise name
UPDATE public.exercise_families
SET family_name = 'Planking - Basic'
WHERE family_key = 'basic_planking';

UPDATE public.exercise_families
SET family_name = 'Planking - Advanced'
WHERE family_key = 'advanced_planking';

UPDATE public.exercise_families
SET family_name = 'Leg Lifts - Basic'
WHERE family_key = 'basic_leg_lifts';

UPDATE public.exercise_families
SET family_name = 'Leg Lifts - Advanced'
WHERE family_key = 'advanced_leg_lifts';

-- Update display order for alphabetical sorting (top-level categories)
-- while maintaining difficulty precedence within each category

-- Cardio & Strength (alphabetically first)
UPDATE public.exercise_families
SET display_order = 1
WHERE family_key = 'cardio_strength';

-- Leg Lifts (alphabetically second, with Basic before Advanced)
UPDATE public.exercise_families
SET display_order = 2
WHERE family_key = 'basic_leg_lifts';

UPDATE public.exercise_families
SET display_order = 3
WHERE family_key = 'advanced_leg_lifts';

-- Planking (alphabetically third, with Basic before Advanced)
UPDATE public.exercise_families
SET display_order = 4
WHERE family_key = 'basic_planking';

UPDATE public.exercise_families
SET display_order = 5
WHERE family_key = 'advanced_planking';

-- Seated Movement (alphabetically fourth, keeping "Seated" prefix)
UPDATE public.exercise_families
SET display_order = 6
WHERE family_key = 'seated_exercise';

-- Standing Movement (alphabetically fifth, keeping "Standing" prefix)
UPDATE public.exercise_families
SET display_order = 7
WHERE family_key = 'standing_movement';