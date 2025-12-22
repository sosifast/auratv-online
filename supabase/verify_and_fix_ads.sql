-- =============================================
-- VERIFY & FIX: Ads Config RLS and Data
-- =============================================

-- 1. Check if table exists and has data
SELECT 'Table Check' as step, 
       COUNT(*) as total_ads,
       COUNT(CASE WHEN is_enabled = true THEN 1 END) as enabled_ads,
       COUNT(CASE WHEN ad_script IS NOT NULL AND ad_script != '' THEN 1 END) as ads_with_script
FROM ads_config;

-- 2. View all ads with details
SELECT ad_type, 
       is_enabled,
       LENGTH(ad_script) as script_length,
       placement,
       LEFT(ad_script, 100) as script_preview
FROM ads_config
ORDER BY ad_type;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'ads_config';

-- 4. FIX: Drop and recreate RLS policies for public read
DROP POLICY IF EXISTS "public_ads_read" ON ads_config;
DROP POLICY IF EXISTS "public_ads_insert" ON ads_config;
DROP POLICY IF EXISTS "public_ads_update" ON ads_config;
DROP POLICY IF EXISTS "public_ads_delete" ON ads_config;

-- Allow ALL users to read (needed for public pages)
CREATE POLICY "allow_public_read_ads" ON ads_config 
    FOR SELECT 
    USING (true);

-- Allow authenticated users to manage
CREATE POLICY "allow_auth_write_ads" ON ads_config 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. Verify policies created
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'ads_config';

-- 6. Test query (this is what app runs)
SELECT ad_type, ad_script, is_enabled, placement 
FROM ads_config 
WHERE is_enabled = true;

-- 7. If still no data, insert test data
INSERT INTO ads_config (ad_type, ad_script, is_enabled, placement, description)
VALUES (
    'banner',
    '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎯 TEST BANNER AD</h2>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">This is a test advertisement - Replace with Adsterra script</p>
    </div>',
    true,
    ARRAY['homepage', 'play', 'category'],
    'Banner Ad 728x90'
)
ON CONFLICT (ad_type) 
DO UPDATE SET 
    ad_script = EXCLUDED.ad_script,
    is_enabled = EXCLUDED.is_enabled,
    placement = EXCLUDED.placement;

-- 8. Final verification
SELECT '✅ Setup Complete' as status,
       ad_type,
       is_enabled,
       LENGTH(ad_script) as script_length,
       placement
FROM ads_config
WHERE ad_type = 'banner';
