-- ============================================================================
-- MySound Row Level Security (RLS) Policies (Phase 2 Foundation)
-- Enforce single-owner private access: auth.uid() = owner_id
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Owner can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Owner can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Owner can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. ARTISTS POLICIES
CREATE POLICY "Owner can manage own artists"
  ON public.artists FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 3. ALBUMS POLICIES
CREATE POLICY "Owner can manage own albums"
  ON public.albums FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 4. GENRES POLICIES
CREATE POLICY "Owner can manage own genres"
  ON public.genres FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5. TRACKS POLICIES
CREATE POLICY "Owner can manage own tracks"
  ON public.tracks FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 6. PLAYLISTS POLICIES
CREATE POLICY "Owner can manage own playlists"
  ON public.playlists FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 7. PLAYLIST_TRACKS POLICIES (Joined with playlist ownership)
CREATE POLICY "Owner can manage own playlist tracks"
  ON public.playlist_tracks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.owner_id = auth.uid()
    )
  );

-- 8. FAVORITES POLICIES
CREATE POLICY "Owner can manage own favorites"
  ON public.favorites FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 9. LISTENING_HISTORY POLICIES
CREATE POLICY "Owner can manage own listening history"
  ON public.listening_history FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 10. PLAYBACK_STATE POLICIES
CREATE POLICY "Owner can manage own playback state"
  ON public.playback_state FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 11. DEVICES POLICIES
CREATE POLICY "Owner can manage own devices"
  ON public.devices FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 12. DEVICE_DOWNLOADS POLICIES
CREATE POLICY "Owner can manage own device downloads"
  ON public.device_downloads FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 13. USER_SETTINGS POLICIES
CREATE POLICY "Owner can manage own user settings"
  ON public.user_settings FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
