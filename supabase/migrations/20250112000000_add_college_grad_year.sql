-- Add college and grad_year columns to demand_waitlist table
ALTER TABLE demand_waitlist
ADD COLUMN IF NOT EXISTS college text,
ADD COLUMN IF NOT EXISTS grad_year text;
