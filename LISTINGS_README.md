# Listings Page Implementation

This document provides setup instructions and details for the newly implemented listings page.

## 🎉 Features Implemented

### Core Features
- ✅ Swipeable listing cards with Framer Motion gestures
- ✅ Interactive Mapbox map with clickable price markers
- ✅ City filter (All, San Francisco, Washington DC, New York)
- ✅ Date range filtering (Move-In and Move-Out dates)
- ✅ Like/Pass functionality with visual indicators
- ✅ Liked listings page
- ✅ Responsive design (mobile & desktop)
- ✅ 9 mock listings (3 per city)

### Pages Created
- `/listings` - Main listings page with map and swipeable cards
- `/listings/liked` - View all liked listings

### Components Created
- `ListingCard` - Swipeable card with like/pass gestures
- `ListingMap` - Mapbox integration with price markers
- `FilterBar` - City and date filters

## 📦 Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
npm install mapbox-gl react-map-gl lucide-react
```

### 2. Get Mapbox Access Token

1. Go to [https://www.mapbox.com/](https://www.mapbox.com/)
2. Sign up for a free account
3. Go to your [Account Page](https://account.mapbox.com/)
4. Copy your **Default public token**

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**IMPORTANT**: Without this token, the map will show a placeholder message instead of the interactive map.

### 4. Run the Development Server

```bash
npm run dev
```

Then visit:
- Main listings page: [http://localhost:3000/listings](http://localhost:3000/listings)
- Liked listings: [http://localhost:3000/listings/liked](http://localhost:3000/listings/liked)

## 🗺️ How It Works

### Swipe Gestures
- **Swipe Right** or **Click Heart Button**: Like the listing (saves to localStorage)
- **Swipe Left** or **Click X Button**: Pass on the listing
- **View Details**: Opens listing details (placeholder for now)

### Map Interaction
- Click any price marker on the map to view that listing
- Map automatically centers on selected city
- Selected listing is highlighted on map

### Filtering
- **City Filter**: Click city buttons to filter listings by location
- **Date Filter**: Enter move-in and move-out dates to see available listings
- Filters update in real-time

### Data Storage (Current)
- Liked listings are stored in **localStorage** (browser-only)
- Mock data is used for listings (see `lib/listings-data.ts`)

## 🗄️ Database Setup (Future)

When you're ready to use real data with user accounts:

### 1. Run the Supabase Migration

The SQL migration file is located at: `supabase-migrations/create-listings-tables.sql`

To run it:
```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and paste the contents of the migration file

# Option 2: Via Supabase CLI (if installed)
supabase db push
```

### 2. Tables Created
- `listings` - Stores all housing listings
- `liked_listings` - Tracks which users liked which listings

### 3. Update API Routes

Once the database is set up, uncomment the database code in:
- `app/api/listings/route.ts`
- `app/api/listings/liked/route.ts`

## 📁 File Structure

```
/app/
  /listings/
    page.tsx                  # Main listings page
    /liked/
      page.tsx                # Liked listings page
  /api/
    /listings/
      route.ts                # GET endpoint for listings
      /liked/
        route.ts              # POST/GET/DELETE for liked listings

/components/
  /listings/
    ListingCard.tsx           # Swipeable card component
    ListingMap.tsx            # Mapbox map component
    FilterBar.tsx             # Filter controls

/lib/
  listings-data.ts            # Mock data + TypeScript types

/supabase-migrations/
  create-listings-tables.sql  # Database schema
```

## 🎨 Design System

The implementation follows your existing design system:
- **Colors**: Gray-scale (50, 200, 300, 900)
- **Borders**: `border-gray-200`, `rounded-md`
- **Font**: Encode Sans Semi Expanded
- **Buttons**: Outlined style with hover states
- **Animations**: Subtle (200ms transitions)

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Map on left (40% width)
- Cards on right (60% width)
- Filter bar above cards

### Mobile (<1024px)
- Map at top (400px height)
- Filter bar below map
- Cards below (full-width swipeable)

## 🚀 Next Steps

### To Make It Production-Ready:

1. **Add Mapbox Token**
   - Get token from Mapbox
   - Add to `.env.local`

2. **Set Up Database** (Optional)
   - Run the SQL migration
   - Update API routes to use database instead of localStorage

3. **Add User Authentication** (Future)
   - Integrate with Supabase Auth
   - Replace localStorage with database for liked listings
   - Add user_id to listings table

4. **Create Listing Detail Page**
   - Add `/listings/[id]/page.tsx`
   - Show full listing details, all photos, amenities
   - Add contact/booking functionality

5. **Add More Features** (Future)
   - More filters (price range, bedrooms, amenities)
   - Search by address/neighborhood
   - Save search preferences
   - Email notifications for new listings

## 🐛 Troubleshooting

### Map Not Showing
- Check that `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is in `.env.local`
- Restart the dev server after adding environment variables
- Verify token is valid at [Mapbox Dashboard](https://account.mapbox.com/)

### Liked Listings Not Persisting
- Currently using localStorage (browser-only)
- Liked listings will be lost if browser data is cleared
- Set up database for persistent storage

### Build Errors
- Run `npm run build` to check for errors
- All TypeScript errors should be resolved

## 📊 Mock Data

Currently showing 9 listings:
- **San Francisco**: 3 listings ($2.8k - $4.5k/mo)
- **Washington DC**: 3 listings ($2.2k - $3.8k/mo)
- **New York**: 3 listings ($3k - $4.2k/mo)

All available from May-December 2026.

## 💡 Tips

- Swipe threshold is 100px (adjust in `ListingCard.tsx` if needed)
- Map markers show price as `$X.Xk` (e.g., "$2.8k" for $2800)
- Liked listings are stored as an array of IDs in localStorage key: `likedListings`
- Date filtering checks if listing availability overlaps with selected dates

---

Built with Next.js 15, React 18, Framer Motion, Mapbox GL JS, and Tailwind CSS.
