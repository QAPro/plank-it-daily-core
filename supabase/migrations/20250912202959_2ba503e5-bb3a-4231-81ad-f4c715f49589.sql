-- Check which exercises are missing and add them
WITH missing_exercises AS (
  SELECT exercise_name FROM (
    VALUES 
    ('Gentle Arm Swings While Walking'),
    ('Side-Lying Leg Lifts'),
    ('Single-Arm Single-Leg Plank'),
    ('Push-Up Hold (bottom position)'),
    ('Plank to Pike'),
    ('Dynamic Plank Variations')
  ) AS t(exercise_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM plank_exercises WHERE name = t.exercise_name
  )
)
INSERT INTO plank_exercises (name, description, difficulty_level, category, instructions, image_url, tags, estimated_calories_per_minute, primary_muscles, equipment_needed, is_beginner_friendly)
SELECT 
  CASE me.exercise_name
    WHEN 'Gentle Arm Swings While Walking' THEN 'Gentle Arm Swings While Walking'
    WHEN 'Side-Lying Leg Lifts' THEN 'Side-Lying Leg Lifts'
    WHEN 'Single-Arm Single-Leg Plank' THEN 'Single-Arm Single-Leg Plank'
    WHEN 'Push-Up Hold (bottom position)' THEN 'Push-Up Hold (bottom position)'
    WHEN 'Plank to Pike' THEN 'Plank to Pike'
    WHEN 'Dynamic Plank Variations' THEN 'Dynamic Plank Variations'
  END,
  CASE me.exercise_name
    WHEN 'Gentle Arm Swings While Walking' THEN 'Easy walking combined with gentle arm movements for low-impact cardio.'
    WHEN 'Side-Lying Leg Lifts' THEN 'Leg lifts performed while lying on your side to target outer thighs.'
    WHEN 'Single-Arm Single-Leg Plank' THEN 'Expert plank variation lifting opposite arm and leg simultaneously.'
    WHEN 'Push-Up Hold (bottom position)' THEN 'Isometric hold at the bottom of a push-up position.'
    WHEN 'Plank to Pike' THEN 'Dynamic movement from plank to downward dog position.'
    WHEN 'Dynamic Plank Variations' THEN 'Various dynamic plank movements for advanced practitioners.'
  END,
  CASE me.exercise_name
    WHEN 'Gentle Arm Swings While Walking' THEN 1
    WHEN 'Side-Lying Leg Lifts' THEN 1
    ELSE 4
  END,
  CASE me.exercise_name
    WHEN 'Gentle Arm Swings While Walking' THEN 'cardio'
    WHEN 'Side-Lying Leg Lifts' THEN 'leg_lift'
    ELSE 'expanded_plank'
  END,
  ARRAY['Basic instruction', 'Keep form proper', 'Breathe steadily'],
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  ARRAY['exercise'],
  5.0,
  ARRAY['core'],
  ARRAY[]::text[],
  CASE me.exercise_name
    WHEN 'Gentle Arm Swings While Walking' THEN true
    WHEN 'Side-Lying Leg Lifts' THEN true
    ELSE false
  END
FROM missing_exercises me;