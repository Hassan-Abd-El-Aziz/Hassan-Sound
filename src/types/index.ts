export type Locale = 'ar' | 'en'

export type RepeatMode = 'off' | 'one' | 'all'

export type DownloadStatus = 'not_downloaded' | 'queued' | 'downloading' | 'downloaded' | 'failed'

export interface Artist {
  id: string
  name: string
  track_count?: number
  album_count?: number
  created_at?: string
}

export interface Album {
  id: string
  title: string
  artist_id?: string
  artist_name?: string
  cover_url?: string
  cover_storage_path?: string
  release_year?: number
  track_count?: number
  created_at?: string
}

export interface Track {
  id: string
  owner_id?: string
  title: string
  artist_id?: string
  artist_name?: string
  album_id?: string
  album_title?: string
  genre_id?: string
  genre_name?: string
  track_number?: number
  release_year?: number
  duration_ms: number
  mime_type?: string
  file_extension?: string
  file_size_bytes?: number
  bitrate?: number
  sample_rate?: number
  storage_path: string
  cover_storage_path?: string
  cover_url?: string
  content_hash?: string
  is_favorite?: boolean
  download_status?: DownloadStatus
  created_at?: string
  updated_at?: string
}

export interface Playlist {
  id: string
  owner_id?: string
  title: string
  description?: string
  track_count?: number
  cover_url?: string
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface Device {
  id: string
  device_id: string
  device_name: string
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
  last_active_at: string
}

export interface PlaybackStateSync {
  track_id: string
  position_ms: number
  device_id: string
  updated_at: string
}
