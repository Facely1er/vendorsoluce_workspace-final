-- Migration: Ensure free tier default for trial mode
-- Sets subscription_tier = 'free' for profiles with null tier

UPDATE vs_profiles
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;

-- Ensure default for new rows
ALTER TABLE vs_profiles
ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Fix check_usage_limit to treat null tier as 'free'
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS TABLE(used INTEGER, limit_value INTEGER, can_use BOOLEAN)
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT COALESCE(subscription_tier, 'free') INTO v_tier
  FROM vs_profiles
  WHERE id = p_user_id;

  SELECT (features->p_feature)::INTEGER INTO v_limit
  FROM vs_prices
  WHERE tier = v_tier
  LIMIT 1;

  SELECT COALESCE(SUM(quantity), 0)::INTEGER INTO v_used
  FROM vs_usage_records
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period_start = date_trunc('month', NOW());

  RETURN QUERY
  SELECT 
    v_used,
    COALESCE(v_limit, 0),
    (COALESCE(v_limit, 0) = -1 OR v_used < COALESCE(v_limit, 0)) AS can_use;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
