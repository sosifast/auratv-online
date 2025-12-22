-- =============================================
-- FIX: Row Level Security for All Tables
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CATEGORY TABLE
-- =============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON category;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON category;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON category;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON category;
DROP POLICY IF EXISTS "public_category_read" ON category;
DROP POLICY IF EXISTS "public_category_insert" ON category;
DROP POLICY IF EXISTS "public_category_update" ON category;
DROP POLICY IF EXISTS "public_category_delete" ON category;

CREATE POLICY "public_category_read" ON category FOR SELECT USING (true);
CREATE POLICY "public_category_insert" ON category FOR INSERT WITH CHECK (true);
CREATE POLICY "public_category_update" ON category FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_category_delete" ON category FOR DELETE USING (true);

ALTER TABLE category ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. STREAMING TABLE
-- =============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON streaming;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "public_streaming_read" ON streaming;
DROP POLICY IF EXISTS "public_streaming_insert" ON streaming;
DROP POLICY IF EXISTS "public_streaming_update" ON streaming;
DROP POLICY IF EXISTS "public_streaming_delete" ON streaming;

CREATE POLICY "public_streaming_read" ON streaming FOR SELECT USING (true);
CREATE POLICY "public_streaming_insert" ON streaming FOR INSERT WITH CHECK (true);
CREATE POLICY "public_streaming_update" ON streaming FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_streaming_delete" ON streaming FOR DELETE USING (true);

ALTER TABLE streaming ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. STREAMING_PLAYLIST TABLE
-- =============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON streaming_playlist;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON streaming_playlist;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON streaming_playlist;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON streaming_playlist;
DROP POLICY IF EXISTS "public_playlist_read" ON streaming_playlist;
DROP POLICY IF EXISTS "public_playlist_insert" ON streaming_playlist;
DROP POLICY IF EXISTS "public_playlist_update" ON streaming_playlist;
DROP POLICY IF EXISTS "public_playlist_delete" ON streaming_playlist;

CREATE POLICY "public_playlist_read" ON streaming_playlist FOR SELECT USING (true);
CREATE POLICY "public_playlist_insert" ON streaming_playlist FOR INSERT WITH CHECK (true);
CREATE POLICY "public_playlist_update" ON streaming_playlist FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_playlist_delete" ON streaming_playlist FOR DELETE USING (true);

ALTER TABLE streaming_playlist ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. VERIFY ALL POLICIES
-- =============================================
SELECT 
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual = 'true' OR with_check = 'true' THEN 'Public Access'
        ELSE 'Restricted'
    END as access_level
FROM pg_policies 
WHERE tablename IN ('category', 'streaming', 'streaming_playlist')
ORDER BY tablename, policyname;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies updated successfully!';
    RAISE NOTICE '📋 Tables affected: category, streaming, streaming_playlist';
    RAISE NOTICE '🔓 All tables now allow public CRUD operations';
    RAISE NOTICE '⚠️  For production, consider restricting to admin users only';
END $$;
