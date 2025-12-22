-- =============================================
-- FIX: Row Level Security Policy for Category
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- 1. DROP existing policies on category table
DROP POLICY IF EXISTS "Enable read access for all users" ON category;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON category;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON category;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON category;
DROP POLICY IF EXISTS "public_category_read" ON category;
DROP POLICY IF EXISTS "admin_category_write" ON category;

-- 2. CREATE simple public policies for category

-- Allow public to read categories
CREATE POLICY "public_category_read" ON category
    FOR SELECT
    USING (true);

-- Allow public to insert categories (for registration/creation)
CREATE POLICY "public_category_insert" ON category
    FOR INSERT
    WITH CHECK (true);

-- Allow public to update categories
CREATE POLICY "public_category_update" ON category
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow public to delete categories
CREATE POLICY "public_category_delete" ON category
    FOR DELETE
    USING (true);

-- 3. Verify RLS is enabled
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

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
WHERE tablename = 'category';

-- =============================================
-- NOTES:
-- =============================================
-- Current setup allows public access for development
-- For production, consider:
-- 1. Use service_role key for admin operations
-- 2. Restrict INSERT/UPDATE/DELETE to authenticated users
-- 3. Add role-based checks (admin only)
-- =============================================

-- OPTIONAL: Production-ready policies (commented out)
/*
-- Admin-only write operations
CREATE POLICY "admin_category_write" ON category
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
            AND users.level = 'Admin'
            AND users.status = 'Active'
        )
    );

-- Public read only
CREATE POLICY "public_category_read" ON category
    FOR SELECT
    USING (status = 'Active');
*/
