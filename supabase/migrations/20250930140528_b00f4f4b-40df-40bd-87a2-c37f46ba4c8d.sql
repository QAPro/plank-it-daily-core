-- Fix remaining functions with mutable search_path

-- Update calculate_mastery_score if it exists
CREATE OR REPLACE FUNCTION public.calculate_mastery_score(
  technique_score NUMERIC,
  consistency_score NUMERIC,
  progression_score NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN ROUND(
    (technique_score * 0.4 + consistency_score * 0.3 + progression_score * 0.3),
    2
  );
END;
$$;

-- Update formatPrice function if it exists
CREATE OR REPLACE FUNCTION public.format_price(amount_cents INTEGER, currency TEXT DEFAULT 'usd')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  formatted_amount TEXT;
BEGIN
  formatted_amount := CASE currency
    WHEN 'usd' THEN '$' || (amount_cents / 100.0)::TEXT
    WHEN 'eur' THEN '€' || (amount_cents / 100.0)::TEXT
    ELSE (amount_cents / 100.0)::TEXT || ' ' || UPPER(currency)
  END;
  
  RETURN formatted_amount;
END;
$$;