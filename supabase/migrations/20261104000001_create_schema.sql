-- ============================================================================
-- MySound Database Schema (Phase 2 Foundation)
-- Tables: profiles, artists, albums, genres, tracks, playlists,
--         playlist_tracks, favorites, listening_history, playback_state,
--         devices, device_downloads, user_settings
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Tied to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ARTISTS
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_artist_name_per_owner UNIQUE(owner_id, name)
);

-- 3. ALBUMS
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  release_year INT,
  cover_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GENRES
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_genre_name_per_owner UNIQUE(owner_id, name)
);

-- 5. TRACKS
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  genre_id UUID REFERENCES public.genres(id) ON DELETE SET NULL,
  track_number INT DEFAULT 1,
  release_year INT,
  duration_ms INT NOT NULL DEFAULT 0,
  mime_type TEXT,
  file_extension TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  bitrate INT,
  sample_rate INT,
  storage_path TEXT NOT NULL,
  cover_storage_path TEXT,
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PLAYLISTS
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLAYLIST_TRACKS
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_track_in_playlist UNIQUE(playlist_id, track_id)
);

-- 8. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_favorite_track_per_owner UNIQUE(owner_id, track_id)
);

-- 9. LISTENING_HISTORY
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  device_id TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration_listened_ms INT DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- 10. PLAYBACK_STATE (Current playing position across devices)
CREATE TABLE IF NOT EXISTS public.playback_state (
  owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  position_ms INT NOT NULL DEFAULT 0,
  device_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DEVICES (Device registry for each connected browser/device)
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_device_id_per_owner UNIQUE(owner_id, device_id)
);

-- 12. DEVICE_DOWNLOADS (Track download status isolated per device)
CREATE TABLE IF NOT EXISTS public.device_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  download_status TEXT NOT NULL DEFAULT 'downloaded', -- 'queued', 'downloading', 'downloaded', 'failed'
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_device_track_download UNIQUE(device_id, track_id)
);

-- 13. USER_SETTINGS (Preferences, language, theme)
CREATE TABLE IF NOT EXISTS public.user_settings (
  owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'ar',
  theme TEXT NOT NULL DEFAULT 'dark',
  audio_quality TEXT NOT NULL DEFAULT 'original',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tracks_owner ON public.tracks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON public.tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_content_hash ON public.tracks(owner_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON public.playlist_tracks(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_favorites_owner ON public.favorites(owner_id);
CREATE INDEX IF NOT EXISTS idx_history_owner_time ON public.listening_history(owner_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_downloads ON public.device_downloads(device_id, track_id);
