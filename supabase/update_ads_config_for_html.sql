-- =============================================
-- UPDATE: Ads Configuration Table for Full HTML Script
-- =============================================

-- Drop old columns
ALTER TABLE ads_config 
DROP COLUMN IF EXISTS ad_key,
DROP COLUMN IF EXISTS ad_script_url;

-- Add new columns for full HTML
ALTER TABLE ads_config 
ADD COLUMN ad_script TEXT,
ADD COLUMN ad_notes TEXT;

-- Add comments
COMMENT ON COLUMN ads_config.ad_script IS 'Full HTML script from Adsterra (paste as-is)';
COMMENT ON COLUMN ads_config.ad_notes IS 'Optional notes about this ad';

-- Update existing rows with empty scripts
UPDATE ads_config SET ad_script = '', ad_notes = 'Paste your Adsterra script here';

-- Example data for reference
COMMENT ON TABLE ads_config IS 'Full HTML script example:
<script async="async" data-cfasync="false" src="https://pl28309557.effectivegatecpm.com/YOUR_KEY/invoke.js"></script>
<div id="container-YOUR_KEY"></div>';

-- Verify
SELECT id, ad_type, 
       LEFT(ad_script, 50) as script_preview, 
       is_enabled, 
       placement 
FROM ads_config 
ORDER BY ad_type;
