-- =============================================
-- AURATV DATABASE SCHEMA
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'Member' CHECK (level IN ('Member', 'Admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active', 'Suspend')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =============================================
-- 2. CATEGORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    icon_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug);
CREATE INDEX IF NOT EXISTS idx_category_status ON category(status);

-- =============================================
-- 3. STREAMING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS streaming (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_category UUID NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    title_seo VARCHAR(255),
    desc_seo TEXT,
    url_banner TEXT,
    view_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streaming_slug ON streaming(slug);
CREATE INDEX IF NOT EXISTS idx_streaming_category ON streaming(id_category);
CREATE INDEX IF NOT EXISTS idx_streaming_status ON streaming(status);
CREATE INDEX IF NOT EXISTS idx_streaming_view_count ON streaming(view_count DESC);

-- =============================================
-- 4. STREAMING_PLAYLIST TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS streaming_playlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_streaming UUID NOT NULL REFERENCES streaming(id) ON DELETE CASCADE,
    url_streaming TEXT NOT NULL,
    type_streaming VARCHAR(10) NOT NULL DEFAULT 'mp4' CHECK (type_streaming IN ('mp4', 'm3u8', 'ts')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_streaming_playlist_streaming ON streaming_playlist(id_streaming);
CREATE INDEX IF NOT EXISTS idx_streaming_playlist_status ON streaming_playlist(status);
CREATE INDEX IF NOT EXISTS idx_streaming_playlist_type ON streaming_playlist(type_streaming);

-- =============================================
-- 5. SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_site VARCHAR(255) NOT NULL DEFAULT 'AuraTV',
    favicon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TRIGGER: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_updated_at ON category;
CREATE TRIGGER update_category_updated_at
    BEFORE UPDATE ON category
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaming_updated_at ON streaming;
CREATE TRIGGER update_streaming_updated_at
    BEFORE UPDATE ON streaming
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaming_playlist_updated_at ON streaming_playlist;
CREATE TRIGGER update_streaming_playlist_updated_at
    BEFORE UPDATE ON streaming_playlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_playlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- Category policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON category
    FOR SELECT USING (status = 'Active');

CREATE POLICY "Admins can manage categories" ON category
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- Streaming policies (public read, admin write)
CREATE POLICY "Anyone can view active streaming" ON streaming
    FOR SELECT USING (status = 'Active');

CREATE POLICY "Admins can manage streaming" ON streaming
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- Streaming playlist policies
CREATE POLICY "Anyone can view active playlists" ON streaming_playlist
    FOR SELECT USING (status = 'Active');

CREATE POLICY "Admins can manage playlists" ON streaming_playlist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- Settings policies (public read, admin write)
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default settings
INSERT INTO settings (name_site, favicon_url) 
VALUES ('AuraTV', '/favicon.ico')
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO category (name, slug, icon_url, status) VALUES
    ('Action', 'action', '🎬', 'Active'),
    ('Drama', 'drama', '🎭', 'Active'),
    ('Comedy', 'comedy', '😂', 'Active'),
    ('Horror', 'horror', '👻', 'Active'),
    ('Romance', 'romance', '💕', 'Active'),
    ('Sci-Fi', 'sci-fi', '🚀', 'Active'),
    ('Documentary', 'documentary', '📚', 'Active'),
    ('Animation', 'animation', '🎨', 'Active')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Streaming with category info
CREATE OR REPLACE VIEW streaming_with_category AS
SELECT 
    s.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon_url as category_icon
FROM streaming s
LEFT JOIN category c ON s.id_category = c.id;

-- View: Popular streaming (sorted by view count)
CREATE OR REPLACE VIEW popular_streaming AS
SELECT * FROM streaming
WHERE status = 'Active'
ORDER BY view_count DESC
LIMIT 20;

-- =============================================
-- DONE! Your database schema is ready.
-- =============================================
