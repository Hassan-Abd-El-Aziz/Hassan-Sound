import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here'
  )
}

// Fallback dummy URL and anon key for clean initialization when env vars are missing
const safeUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co'
const safeAnonKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

/**
 * Storage Service Helpers
 * Handles signed URLs for private audio tracks and cover artwork.
 * Never exposes permanent public URLs.
 */
export const storageService = {
  /**
   * Generates a short-lived signed URL to stream a private audio file.
   * @param path Storage path inside 'audio' bucket (e.g. 'userId/track-id.mp3')
   * @param expiresIn Validity duration in seconds (default: 3600s = 1 hour)
   */
  async getSignedAudioUrl(path: string, expiresIn = 3600): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: null, error: new Error('Supabase is not configured') }
    }

    try {
      const { data, error } = await supabase.storage
        .from('audio')
        .createSignedUrl(path, expiresIn)

      if (error) throw error
      return { url: data.signedUrl, error: null }
    } catch (err: any) {
      console.error('[StorageService] Error getting signed audio URL:', err)
      return { url: null, error: err }
    }
  },

  /**
   * Generates a signed URL for private album/track cover artwork.
   * @param path Storage path inside 'covers' bucket
   * @param expiresIn Validity duration in seconds (default: 7200s = 2 hours)
   */
  async getSignedCoverUrl(path: string, expiresIn = 7200): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: null, error: new Error('Supabase is not configured') }
    }

    try {
      const { data, error } = await supabase.storage
        .from('covers')
        .createSignedUrl(path, expiresIn)

      if (error) throw error
      return { url: data.signedUrl, error: null }
    } catch (err: any) {
      console.error('[StorageService] Error getting signed cover URL:', err)
      return { url: null, error: err }
    }
  },

  /**
   * Uploads an audio file to the private 'audio' bucket.
   * Stores files organized by user UUID folder for strict RLS policy matching.
   */
  async uploadAudio(file: File, userId: string, trackId: string): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: null, error: new Error('Supabase is not configured') }
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${trackId}.${fileExt}`

    try {
      const { data, error } = await supabase.storage
        .from('audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error
      return { path: data.path, error: null }
    } catch (err: any) {
      console.error('[StorageService] Audio upload error:', err)
      return { path: null, error: err }
    }
  },

  /**
   * Uploads a cover image to the private 'covers' bucket.
   */
  async uploadCover(file: File, userId: string, albumOrTrackId: string): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: null, error: new Error('Supabase is not configured') }
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${albumOrTrackId}.${fileExt}`

    try {
      const { data, error } = await supabase.storage
        .from('covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error
      return { path: data.path, error: null }
    } catch (err: any) {
      console.error('[StorageService] Cover upload error:', err)
      return { path: null, error: err }
    }
  }
}
