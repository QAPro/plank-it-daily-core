-- Phase 3A: Reputation & Status Foundation - Database schema

-- 1) Reputation summary per user/domain
CREATE TABLE IF NOT EXISTS public.user_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL,
  expertise_score integer NOT NULL DEFAULT 0,
  karma_score integer NOT NULL DEFAULT 0,
  total_upvotes integer NOT NULL DEFAULT 0,
  total_contributions integer NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain)
);

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- Anyone can view reputation (public-facing status)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_reputation' AND policyname = 'Anyone can view reputation'
  ) THEN
    CREATE POLICY "Anyone can view reputation"
    ON public.user_reputation
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Allow owners to insert/update their own reputation rows (usually managed by triggers)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_reputation' AND policyname = 'Users can insert own reputation'
  ) THEN
    CREATE POLICY "Users can insert own reputation"
    ON public.user_reputation
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_reputation' AND policyname = 'Users can update own reputation'
  ) THEN
    CREATE POLICY "Users can update own reputation"
    ON public.user_reputation
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Reputation events (atomic actions like kudos/upvotes)
CREATE TABLE IF NOT EXISTS public.reputation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,   -- recipient of reputation
  actor_id uuid NOT NULL,  -- giver of reputation
  event_type text NOT NULL, -- e.g., 'kudos', 'upvote', 'accepted_advice'
  domain text,
  points integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- Users can create events only as themselves (actor)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reputation_events' AND policyname = 'Users can insert own events'
  ) THEN
    CREATE POLICY "Users can insert own events"
    ON public.reputation_events
    FOR INSERT
    WITH CHECK (auth.uid() = actor_id);
  END IF;
END $$;

-- Users can view events they are involved in; admins can view all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reputation_events' AND policyname = 'Admins can view all reputation events'
  ) THEN
    CREATE POLICY "Admins can view all reputation events"
    ON public.reputation_events
    FOR SELECT
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reputation_events' AND policyname = 'Users can view own related events'
  ) THEN
    CREATE POLICY "Users can view own related events"
    ON public.reputation_events
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = actor_id);
  END IF;
END $$;

-- Validation: prevent self-awards and normalize fields
CREATE OR REPLACE FUNCTION public.validate_reputation_event()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id = NEW.actor_id THEN
    RAISE EXCEPTION 'Users cannot award reputation to themselves';
  END IF;
  IF NEW.event_type IS NULL OR NEW.event_type = '' THEN
    NEW.event_type := 'kudos';
  END IF;
  IF NEW.domain IS NULL OR NEW.domain = '' THEN
    NEW.domain := 'general';
  END IF;
  IF NEW.points IS NULL THEN
    NEW.points := 0;
  END IF;
  IF abs(NEW.points) > 100 THEN
    RAISE EXCEPTION 'Points out of allowed range (|points| <= 100)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_reputation_event ON public.reputation_events;
CREATE TRIGGER trg_validate_reputation_event
BEFORE INSERT ON public.reputation_events
FOR EACH ROW EXECUTE FUNCTION public.validate_reputation_event();

-- Apply event totals to user_reputation (upsert per domain)
CREATE OR REPLACE FUNCTION public.apply_reputation_event()
RETURNS trigger AS $$
DECLARE
  v_is_upvote boolean := (NEW.event_type IN ('kudos','upvote')) AND NEW.points > 0;
BEGIN
  INSERT INTO public.user_reputation (user_id, domain, karma_score, total_upvotes, total_contributions, last_updated)
  VALUES (NEW.user_id, COALESCE(NEW.domain, 'general'), NEW.points,
          CASE WHEN v_is_upvote THEN 1 ELSE 0 END,
          1,
          now())
  ON CONFLICT (user_id, domain)
  DO UPDATE SET
    karma_score = public.user_reputation.karma_score + NEW.points,
    total_upvotes = public.user_reputation.total_upvotes + CASE WHEN v_is_upvote THEN 1 ELSE 0 END,
    total_contributions = public.user_reputation.total_contributions + 1,
    last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_apply_reputation_event ON public.reputation_events;
CREATE TRIGGER trg_apply_reputation_event
AFTER INSERT ON public.reputation_events
FOR EACH ROW EXECUTE FUNCTION public.apply_reputation_event();

-- 3) Status tracks (foundation schema)
CREATE TABLE IF NOT EXISTS public.user_status_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_name text NOT NULL, -- e.g., 'community', 'core_master', 'consistency_champion'
  track_level integer NOT NULL DEFAULT 0,
  awarded_at timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, track_name)
);

ALTER TABLE public.user_status_tracks ENABLE ROW LEVEL SECURITY;

-- Publicly viewable; owners can manage their own tracks (future automation will adjust levels)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_status_tracks' AND policyname = 'Anyone can view status tracks'
  ) THEN
    CREATE POLICY "Anyone can view status tracks"
    ON public.user_status_tracks
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_status_tracks' AND policyname = 'Users can manage own status tracks'
  ) THEN
    CREATE POLICY "Users can manage own status tracks"
    ON public.user_status_tracks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;