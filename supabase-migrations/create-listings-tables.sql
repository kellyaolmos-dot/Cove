-- Create listings table
-- This table will store all housing listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For future user accounts
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price INTEGER NOT NULL, -- Monthly price in USD
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  max_guests INTEGER NOT NULL DEFAULT 1,
  available_from DATE NOT NULL,
  available_to DATE NOT NULL,
  photos TEXT[] DEFAULT '{}', -- Array of photo URLs
  amenities TEXT[] DEFAULT '{}', -- Array of amenity names
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liked_listings table
-- This table tracks which listings users have liked
CREATE TABLE IF NOT EXISTS liked_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous users (session-based)
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT, -- For anonymous users before they create accounts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id), -- Prevent duplicate likes from same user
  UNIQUE(session_id, listing_id) -- Prevent duplicate likes from same session
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_available_from ON listings(available_from);
CREATE INDEX IF NOT EXISTS idx_listings_available_to ON listings(available_to);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_listings_user_id ON liked_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_listings_listing_id ON liked_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_liked_listings_session_id ON liked_listings(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings table
-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Users can insert their own listings
CREATE POLICY "Users can insert their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for liked_listings table
-- Users can view their own likes
CREATE POLICY "Users can view their own likes"
  ON liked_listings FOR SELECT
  USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- Users can insert their own likes
CREATE POLICY "Users can insert their own likes"
  ON liked_listings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON liked_listings FOR DELETE
  USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- Insert mock data (optional - for testing)
-- This can be run separately when needed
/*
INSERT INTO listings (title, description, address, city, neighborhood, lat, lng, price, bedrooms, bathrooms, max_guests, available_from, available_to, photos, amenities, status)
VALUES
  ('Sunny Mission District Studio', 'Bright studio apartment in the heart of Mission District. Perfect for young professionals.', '3245 Valencia St', 'San Francisco', 'Mission District', 37.7599, -122.4209, 2800, 0, 1, 1, '2026-06-01', '2026-08-31', ARRAY['/placeholder-listing-1.jpg'], ARRAY['WiFi', 'Kitchen', 'Heating', 'Washer'], 'active'),
  ('Charming Nob Hill 1BR', 'Elegant one-bedroom apartment with city views.', '1234 California St', 'San Francisco', 'Nob Hill', 37.7915, -122.4144, 3200, 1, 1, 2, '2026-07-01', '2026-09-30', ARRAY['/placeholder-listing-2.jpg'], ARRAY['WiFi', 'Kitchen', 'AC', 'Parking', 'Gym'], 'active'),
  ('Spacious Hayes Valley 2BR', 'Modern two-bedroom in trendy Hayes Valley.', '567 Hayes St', 'San Francisco', 'Hayes Valley', 37.7756, -122.4264, 4500, 2, 2, 3, '2026-05-01', '2026-10-31', ARRAY['/placeholder-listing-3.jpg'], ARRAY['WiFi', 'Kitchen', 'AC', 'Washer', 'Dryer', 'Dishwasher'], 'active');
*/
