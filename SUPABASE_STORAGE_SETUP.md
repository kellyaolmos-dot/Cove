# Supabase Storage Setup for File Uploads

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter bucket name: `listing-photos`
5. Make it **Public** (check the "Public bucket" option)
6. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

### Option A: Using SQL Editor (Recommended)

Go to SQL Editor and run:

```sql
-- Allow public uploads (authenticated via API)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'listing-photos');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-photos');
```

### Option B: Using Storage UI

1. Click on the `listing-photos` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Create two policies:
   - **INSERT policy**: Allow all inserts to `listing-photos` bucket
   - **SELECT policy**: Allow all reads from `listing-photos` bucket

## Step 3: Verify Setup

Test the upload by:
1. Go to `/waitlist/supply` on your local server
2. Fill out the form
3. Upload a test image
4. Check the Supabase Storage dashboard to see if the file appears

## Bucket Configuration

- **Name**: `listing-photos`
- **Public**: Yes
- **File size limit**: 5MB per file (enforced by API)
- **Allowed file types**: Images only (enforced by API)
- **Max files per submission**: 5 (enforced by API)

## Troubleshooting

### Upload fails with 403 error
- Check that the bucket is set to **Public**
- Verify the storage policies are set correctly

### Upload fails with 413 error
- File is too large (over 5MB)
- User should compress or resize the image

### Files upload but don't appear
- Check the `listing_photos` column in `supply_waitlist` table
- Verify the public URL is being generated correctly
