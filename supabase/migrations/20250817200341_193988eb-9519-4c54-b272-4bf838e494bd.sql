
-- Seed feature flags (enabled)
insert into public.feature_flags (feature_name, is_enabled, description, target_audience, rollout_percentage)
values
  ('seasonal_events', true, 'Enable Seasonal Events and challenges', 'all', 100),
  ('competitive_features', true, 'Enable Leagues, Tournaments, and competitive features', 'all', 100),
  ('friends_system', true, 'Enable Friends & social features', 'all', 100);

-- Seed level unlocks (what level each feature becomes available)
-- Note: These are read-only to end-users; we seed them as baseline definition.
insert into public.level_unlocks (level, feature_name, feature_description, icon, category)
values
  (5,  'seasonal_events',     'Seasonal Events and special challenges unlock at level 5.',   'calendar', 'feature'),
  (8,  'competitive_features','Leagues & Tournaments unlock at level 8.',                    'trophy',   'feature'),
  (10, 'friends_system',      'Friends and social features unlock at level 10.',            'users',    'feature');

-- Seed one active Seasonal Event
with ins_event as (
  insert into public.seasonal_events (
    title, description, start_date, end_date, is_active, event_type, theme_data, participation_requirements
  )
  values (
    'Summer Core Blast',
    'Join the Summer Core Blast with daily plank streaks and total-duration challenges.',
    now() - interval '1 day',
    now() + interval '14 days',
    true,
    'challenge',
    jsonb_build_object('theme', 'summer', 'primaryColor', '#f59e0b'),
    jsonb_build_object('min_level', 1)
  )
  returning id
)
-- Seed a couple of challenges for that event
insert into public.event_challenges (
  event_id, challenge_title, challenge_description, challenge_type, target_criteria, points_reward, is_active, difficulty_level, badge_reward
)
select id, '7-Day Plank Streak', 'Hold a plank each day for 7 days', 'streak',
       jsonb_build_object('days', 7), 100, true, 1, 'streaker'
from ins_event
union all
select id, 'Total 10 Minutes', 'Accumulate 10 minutes of planks during the event', 'duration',
       jsonb_build_object('seconds', 600), 150, true, 2, 'endurance'
from ins_event;

-- Seed one active League and 3 divisions
with ins_league as (
  insert into public.fitness_leagues (
    name, description, league_type, ranking_algorithm, is_active, season_duration_days, max_participants_per_division
  )
  values (
    'Core Strength League',
    'Compete with others and climb divisions based on your performance.',
    'skill_based',
    'elo',
    true,
    30,
    50
  )
  returning id
)
insert into public.league_divisions (
  league_id, division_level, division_name, min_rating, max_rating, promotion_threshold, relegation_threshold, current_participants
)
select id, 1, 'Bronze Division', 0,   999,  0.80, 0.20, 0 from ins_league
union all
select id, 2, 'Silver Division', 1000, 1499, 0.80, 0.20, 0 from ins_league
union all
select id, 3, 'Gold Division',   1500, 9999, 0.80, 0.20, 0 from ins_league;

-- Seed one Tournament currently in registration
insert into public.tournaments (
  title, description, tournament_type, status,
  bracket_size,
  registration_start, registration_end,
  tournament_start, tournament_end,
  max_participants, current_participants
)
values (
  'August Plank Open',
  'Single-elimination tournament. Register now and compete next week!',
  'elimination',
  'registration',
  16,
  now() - interval '1 day',
  now() + interval '5 days',
  now() + interval '7 days',
  now() + interval '14 days',
  64,
  0
);
