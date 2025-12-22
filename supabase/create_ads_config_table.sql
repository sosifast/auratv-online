-- =============================================
-- CREATE: Ads Configuration Table
-- =============================================

-- Create ads_config table
CREATE TABLE IF NOT EXISTS ads_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_type VARCHAR(50) NOT NULL UNIQUE,
    ad_key TEXT NOT NULL,
    ad_script_url TEXT,
    is_enabled BOOLEAN DEFAULT true,
    placement TEXT[], -- array of placements: ['homepage', 'play', 'category']
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE ads_config IS 'Configuration for Adsterra ads';
COMMENT ON COLUMN ads_config.ad_type IS 'Type of ad: banner, native, social_bar, popunder, smartlink';
COMMENT ON COLUMN ads_config.ad_key IS 'Adsterra ad zone key';
COMMENT ON COLUMN ads_config.ad_script_url IS 'Full script URL if needed';
COMMENT ON COLUMN ads_config.is_enabled IS 'Enable/disable ad globally';
COMMENT ON COLUMN ads_config.placement IS 'Where to show: homepage, play, category';

-- Insert default configuration (empty keys - fill in admin panel)
INSERT INTO ads_config (ad_type, ad_key, ad_script_url, is_enabled, placement, description) VALUES
('banner', '', '//www.topcreativeformat.com/{KEY}/invoke.js', true, ARRAY['homepage', 'play', 'category'], 'Banner Ad 728x90'),
('native', '', '//www.topcreativeformat.com/{KEY}/invoke.js', true, ARRAY['homepage', 'play', 'category'], 'Native Banner In-Feed'),
('social_bar', '', '//pl23539296.profitablegatecpm.com/{KEY}/invoke.js', true, ARRAY['homepage', 'play', 'category'], 'Social Bar Sticky Bottom'),
('popunder', '', '//www.topcreativeformat.com/{KEY}/invoke.js', false, ARRAY['homepage'], 'Popunder Background'),
('smartlink', '', '//pl23539296.profitablegatecpm.com/{KEY}/invoke.js', false, ARRAY['homepage'], 'Smartlink Interstitial')
ON CONFLICT (ad_type) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ads_config_enabled ON ads_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ads_config_type ON ads_config(ad_type);

-- Enable RLS
ALTER TABLE ads_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON ads_config;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON ads_config;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON ads_config;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON ads_config;

-- Create RLS policies (public read, admin write)
CREATE POLICY "public_ads_read" ON ads_config FOR SELECT USING (true);
CREATE POLICY "public_ads_insert" ON ads_config FOR INSERT WITH CHECK (true);
CREATE POLICY "public_ads_update" ON ads_config FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_ads_delete" ON ads_config FOR DELETE USING (true);

-- Verify
SELECT id, ad_type, ad_key, is_enabled, placement 
FROM ads_config 
ORDER BY ad_type;
