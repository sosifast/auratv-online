-- =============================================
-- FIX: Row Level Security Policy for Streaming
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- 1. DROP existing policies on streaming table
DROP POLICY IF EXISTS "Enable read access for all users" ON streaming;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON streaming;
DROP POLICY IF EXISTS "public_streaming_read" ON streaming;
DROP POLICY IF EXISTS "admin_streaming_write" ON streaming;

-- 2. CREATE simple public policies for streaming

-- Allow public to read streaming
CREATE POLICY "public_streaming_read" ON streaming
    FOR SELECT
    USING (true);

-- Allow public to insert streaming
CREATE POLICY "public_streaming_insert" ON streaming
    FOR INSERT
    WITH CHECK (true);

-- Allow public to update streaming
CREATE POLICY "public_streaming_update" ON streaming
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow public to delete streaming
CREATE POLICY "public_streaming_delete" ON streaming
    FOR DELETE
    USING (true);

-- 3. Verify RLS is enabled
ALTER TABLE streaming ENABLE ROW LEVEL SECURITY;

-- 4. Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'streaming';
