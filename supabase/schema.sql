-- Demand-side waitlist captures renter interest
create table if not exists demand_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  college text,
  grad_year text,
  status text check (status in ('confirmed','recruiting','exploring')),
  target_cities text[],
  move_in_month text,
  company text,
  roommate_pref text,
  linkedin text,
  contact_pref text[],
  referrer_id uuid,
  created_at timestamp default now()
);

-- Supply-side waitlist stores early listings/landlords
create table if not exists supply_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  address text,
  city text,
  rent numeric,
  rooms int,
  listing_link text,
  willing_to_verify boolean,
  attachment_url text,
  created_at timestamp default now()
);

-- Lightweight analytics table for funnel tracking
create table if not exists waitlist_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  created_at timestamp default now()
);

create index if not exists idx_demand_waitlist_email on demand_waitlist (email);
create index if not exists idx_supply_waitlist_email on supply_waitlist (email);
create index if not exists idx_waitlist_events_type on waitlist_events (event_type);
