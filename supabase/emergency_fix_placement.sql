-- =============================================
-- URGENT FIX: Ads Not Showing Despite Data Exists
-- =============================================

-- 1. Check current data
SELECT ad_type, 
       is_enabled,
       LENGTH(ad_script) as script_len,
       placement,
       pg_typeof(placement) as placement_type
FROM ads_config
ORDER BY ad_type;

-- 2. Check if placement is array or text
-- If it shows "text" instead of "text[]", that's the problem!

-- 3. FIX: Convert placement to proper array if needed
-- First, backup current
CREATE TABLE IF NOT EXISTS ads_config_backup AS 
SELECT * FROM ads_config;

-- Drop and recreate with correct type
ALTER TABLE ads_config 
DROP COLUMN IF EXISTS placement CASCADE;

ALTER TABLE ads_config 
ADD COLUMN placement TEXT[] DEFAULT ARRAY['homepage', 'play', 'category'];

-- Update all rows to have all placements
UPDATE ads_config 
SET placement = ARRAY['homepage', 'play', 'category']
WHERE placement IS NULL;

-- 4. Verify column type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'ads_config' AND column_name = 'placement';

-- Should show: data_type = 'ARRAY', udt_name = '_text'

-- 5. Final check - this is what app queries
SELECT ad_type, 
       ad_script IS NOT NULL as has_script,
       is_enabled,
       placement
FROM ads_config 
WHERE is_enabled = true;

-- 6. Test array contains function
SELECT ad_type,
       'homepage' = ANY(placement) as homepage_match,
       placement @> ARRAY['homepage'] as homepage_contains
FROM ads_config;
