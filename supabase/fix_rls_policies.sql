-- =============================================
-- FIX: Infinite Recursion in Users RLS Policies
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- =============================================

-- 1. DROP ALL EXISTING POLICIES ON USERS TABLE
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;
DROP POLICY IF EXISTS "Anyone can check email for login" ON users;

-- 2. CREATE SIMPLE NON-RECURSIVE POLICIES

-- Allow anyone to INSERT (for public registration)
-- This bypasses auth checks and allows anyone to create an account
CREATE POLICY "public_registration" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to SELECT (for login verification)
-- This allows the login page to check email/password
CREATE POLICY "public_login_check" ON users
    FOR SELECT 
    USING (true);

-- Allow users to UPDATE their own record
-- Using email match instead of auth.uid() to avoid recursion
CREATE POLICY "users_update_own" ON users
    FOR UPDATE 
    USING (email = current_setting('request.jwt.claims', true)::json->>'email')
    WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow users to DELETE their own record (optional)
CREATE POLICY "users_delete_own" ON users
    FOR DELETE 
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- =============================================
-- EXPLANATION:
-- =============================================
-- We removed all policies that check the users table itself (recursive)
-- Now we use simple true/false checks or JWT claims
-- 
-- For production security, consider:
-- 1. Move to Supabase Auth (instead of manual users table)
-- 2. Use service_role key for admin operations
-- 3. Add rate limiting on INSERT to prevent spam registrations
-- =============================================

-- Verify policies are correct
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
WHERE tablename = 'users';
