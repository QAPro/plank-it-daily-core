-- Phase: Ethical cleanup of coercive investment artifacts
-- 1) Drop triggers tied to investment portfolio updates
DROP TRIGGER IF EXISTS update_portfolio_on_sessions ON public.user_sessions;
DROP TRIGGER IF EXISTS update_portfolio_on_reputation ON public.user_reputation;
DROP TRIGGER IF EXISTS update_portfolio_on_streaks ON public.investment_streaks;

-- 2) Drop functions used for fear-based calculations
DROP FUNCTION IF EXISTS public.update_investment_portfolio() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_abandonment_cost(uuid) CASCADE;

-- 3) Remove coercive columns
ALTER TABLE IF EXISTS public.investment_streaks 
  DROP COLUMN IF EXISTS reset_penalty_value;

ALTER TABLE IF EXISTS public.user_seasonal_certifications 
  DROP COLUMN IF EXISTS abandonment_cost;

ALTER TABLE IF EXISTS public.user_exclusive_access 
  DROP COLUMN IF EXISTS abandonment_penalty;

-- 4) Remove the portfolio table that stores abandonment costs
DROP TABLE IF EXISTS public.user_investment_portfolio CASCADE;