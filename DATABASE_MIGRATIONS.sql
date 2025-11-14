-- Database Migrations for Cove v1.0
-- Run these in Supabase SQL Editor

-- ============================================
-- Migration 1: Add Roommate Preferences to Demand Waitlist
-- ============================================
ALTER TABLE demand_waitlist
ADD COLUMN IF NOT EXISTS roommate_preferences TEXT[],
ADD COLUMN IF NOT EXISTS other_roommate_preference TEXT;

-- ============================================
-- Migration 2: Create Pain Points Table
-- ============================================
CREATE TABLE IF NOT EXISTS pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  story TEXT NOT NULL,
  can_reach_out BOOLEAN NOT NULL DEFAULT false,
  contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'none')),
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for pain_points table
CREATE INDEX IF NOT EXISTS idx_pain_points_can_reach_out ON pain_points(can_reach_out) WHERE can_reach_out = true;
CREATE INDEX IF NOT EXISTS idx_pain_points_created_at ON pain_points(created_at DESC);

-- ============================================
-- Verification Queries
-- ============================================

-- Verify roommate_preferences columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'demand_waitlist'
AND column_name IN ('roommate_preferences', 'other_roommate_preference');

-- Verify pain_points table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pain_points'
ORDER BY ordinal_position;

-- Check pain_points indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pain_points';
