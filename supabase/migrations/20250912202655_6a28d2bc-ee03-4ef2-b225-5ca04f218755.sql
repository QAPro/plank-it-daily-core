INSERT INTO plank_exercises (
  name, 
  description, 
  difficulty_level, 
  category,
  instructions,
  image_url,
  tags,
  estimated_calories_per_minute,
  primary_muscles,
  equipment_needed,
  is_beginner_friendly
) VALUES (
  'Shallow Wall Sit (45-degree angle)',
  'A beginner-friendly wall sit performed at a 45-degree angle to reduce intensity while building leg strength.',
  1,
  'wall_sit',
  ARRAY['Stand with back against wall', 'Slide down to 45-degree angle', 'Keep knees aligned over ankles', 'Hold position', 'Keep core engaged'],
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  ARRAY['beginner', 'wall-sit', 'legs', 'isometric'],
  3.5,
  ARRAY['quadriceps', 'glutes', 'calves'],
  ARRAY['wall'],
  true
);