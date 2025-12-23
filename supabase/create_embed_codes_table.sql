-- Table: embed_codes
-- Stores custom embed codes (scripts, meta tags, pixels, etc.) for injection into pages

CREATE TABLE IF NOT EXISTS embed_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    placement VARCHAR(20) NOT NULL DEFAULT 'header' CHECK (placement IN ('header', 'body_start', 'body_end', 'footer')),
    page_target VARCHAR(50) DEFAULT 'all', -- 'all', 'homepage', 'play', 'category', etc.
    priority INTEGER DEFAULT 0, -- Higher priority = loads first
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_embed_codes_enabled ON embed_codes(is_enabled);
CREATE INDEX IF NOT EXISTS idx_embed_codes_placement ON embed_codes(placement);
CREATE INDEX IF NOT EXISTS idx_embed_codes_page_target ON embed_codes(page_target);

-- RLS Policies
ALTER TABLE embed_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read for enabled embed codes
CREATE POLICY "Allow public read for enabled embed codes"
ON embed_codes FOR SELECT
USING (is_enabled = true);

-- Allow authenticated users to manage embed codes
CREATE POLICY "Allow authenticated users to manage embed codes"
ON embed_codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Sample data (optional - remove if not needed)
-- INSERT INTO embed_codes (name, description, code, placement, page_target, priority, is_enabled) VALUES
-- ('Google Analytics', 'Google Analytics 4 tracking', '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-XXXXXXX");</script>', 'header', 'all', 100, false),
-- ('Facebook Pixel', 'Facebook tracking pixel', '<!-- Facebook Pixel Code -->', 'header', 'all', 90, false),
-- ('Custom CSS', 'Custom styling', '<style>/* Custom CSS */</style>', 'header', 'all', 50, false);

COMMENT ON TABLE embed_codes IS 'Stores custom embed codes for injection into pages';
COMMENT ON COLUMN embed_codes.placement IS 'Where to inject: header, body_start, body_end, footer';
COMMENT ON COLUMN embed_codes.page_target IS 'Target page: all, homepage, play, category, search, etc.';
COMMENT ON COLUMN embed_codes.priority IS 'Higher priority loads first (100 = highest)';
