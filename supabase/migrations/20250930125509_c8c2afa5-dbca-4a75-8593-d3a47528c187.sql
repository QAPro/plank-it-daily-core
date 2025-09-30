-- Update Brisk Walking to difficulty level 3
UPDATE plank_exercises 
SET difficulty_level = 3 
WHERE name = 'Brisk Walking' AND category = 'cardio';

-- Insert Walking at Normal Pace exercise at difficulty level 2
INSERT INTO plank_exercises (
  name,
  category,
  difficulty_level,
  description,
  instructions,
  estimated_calories_per_minute,
  primary_muscles,
  equipment_needed,
  is_beginner_friendly,
  tags
) VALUES (
  'Walking at Normal Pace',
  'cardio',
  2,
  'Comfortable walking at a moderate, sustainable pace that elevates heart rate without causing breathlessness',
  ARRAY['Walk at a comfortable pace where you can still hold a conversation', 'Maintain good posture with shoulders back and core engaged', 'Arms swing naturally at your sides', 'Take smooth, even steps'],
  3.5,
  ARRAY['legs', 'glutes', 'core'],
  ARRAY[]::text[],
  true,
  ARRAY['cardio', 'walking', 'low_impact', 'beginner_friendly', 'endurance']
);