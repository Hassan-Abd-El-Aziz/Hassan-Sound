-- ============================================================================
-- MySound Storage Buckets & Policies (Phase 2 Foundation)
-- Creates private buckets: 'audio' and 'covers'
-- Enforces signed URLs: NO public access
-- ============================================================================

-- 1. Create Private Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'audio',
    'audio',
    false, -- strictly private
    104857600, -- 100MB max per audio track
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/x-flac', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/opus']
  ),
  (
    'covers',
    'covers',
    false, -- strictly private
    10485760, -- 10MB max per cover artwork
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Objects Policies for 'audio' Bucket
CREATE POLICY "Authenticated owner can read audio files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can upload audio files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can update audio files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can delete audio files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Storage Objects Policies for 'covers' Bucket
CREATE POLICY "Authenticated owner can read cover files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can upload cover files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can update cover files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated owner can delete cover files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);
