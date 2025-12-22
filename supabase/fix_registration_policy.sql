-- =============================================
-- FIX: Allow Public Registration
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- =============================================

-- Drop existing INSERT policy for users if exists
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;

-- Create new policy that allows public registration
-- This allows anyone to INSERT into users table (for registration)
CREATE POLICY "Anyone can register" ON users
    FOR INSERT WITH CHECK (true);

-- Keep the policy that allows admins to insert (for admin panel)
CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND level = 'Admin'
        )
    );

-- Update SELECT policy to allow users to check their own email during login
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Anyone can check email for login" ON users;

-- Allow anyone to SELECT users by email (needed for login verification)
CREATE POLICY "Anyone can check email for login" ON users
    FOR SELECT USING (true);

-- =============================================
-- DONE! Public registration is now enabled.
-- =============================================
