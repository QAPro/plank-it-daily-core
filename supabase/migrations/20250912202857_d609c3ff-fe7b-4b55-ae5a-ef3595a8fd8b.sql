-- Add missing exercises with proper array casting

-- Add missing exercises one by one with proper typing
INSERT INTO plank_exercises (name, description, difficulty_level, category, instructions, image_url, tags, estimated_calories_per_minute, primary_muscles, equipment_needed, is_beginner_friendly)
VALUES 
('Gentle Arm Swings While Walking', 'Easy walking combined with gentle arm movements for low-impact cardio.', 1, 'cardio', 
ARRAY['Walk at comfortable pace', 'Swing arms gently', 'Keep movements controlled', 'Focus on breathing'], 
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
ARRAY['beginner', 'cardio', 'walking'], 4.0, ARRAY['legs', 'arms'], ARRAY[]::text[], true),

('Side-Lying Leg Lifts', 'Leg lifts performed while lying on your side to target outer thighs.', 1, 'leg_lift',
ARRAY['Lie on side', 'Support head with bottom arm', 'Lift top leg up', 'Lower slowly', 'Keep hips stacked'],
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', 
ARRAY['beginner', 'leg-lift', 'side'], 3.0, ARRAY['hip_abductors', 'glutes'], ARRAY[]::text[], true),

('Single-Arm Single-Leg Plank', 'Expert plank variation lifting opposite arm and leg simultaneously.', 4, 'expanded_plank', 
ARRAY['Start in plank', 'Lift opposite arm and leg', 'Hold position', 'Keep hips level'], 
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', 
ARRAY['expert', 'plank', 'balance'], 8.0, ARRAY['core', 'shoulders', 'glutes'], ARRAY[]::text[], false),

('Push-Up Hold (bottom position)', 'Isometric hold at the bottom of a push-up position.', 4, 'expanded_plank', 
ARRAY['Lower into push-up', 'Hold at bottom', 'Keep body straight', 'Engage core'], 
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', 
ARRAY['expert', 'push-up', 'isometric'], 7.5, ARRAY['chest', 'triceps', 'core'], ARRAY[]::text[], false),

('Plank to Pike', 'Dynamic movement from plank to downward dog position.', 4, 'expanded_plank', 
ARRAY['Start in plank', 'Lift hips up', 'Form inverted V', 'Return to plank'], 
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', 
ARRAY['expert', 'dynamic', 'plank'], 7.0, ARRAY['core', 'shoulders', 'hamstrings'], ARRAY[]::text[], false),

('Dynamic Plank Variations', 'Various dynamic plank movements for advanced practitioners.', 4, 'expanded_plank', 
ARRAY['Start in plank', 'Add dynamic movements', 'Maintain core engagement', 'Vary movements'], 
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', 
ARRAY['expert', 'dynamic', 'variations'], 8.5, ARRAY['core', 'full_body'], ARRAY[]::text[], false)

ON CONFLICT (name) DO NOTHING;