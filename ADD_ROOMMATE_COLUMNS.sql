-- Add roommate preference columns to demand_waitlist table
-- Run this in Supabase SQL Editor

ALTER TABLE demand_waitlist
ADD COLUMN IF NOT EXISTS roommate_preferences TEXT[],
ADD COLUMN IF NOT EXISTS other_roommate_preference TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'demand_waitlist'
AND column_name IN ('roommate_preferences', 'other_roommate_preference');
