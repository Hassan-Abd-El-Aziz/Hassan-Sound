import { supabase, isSupabaseConfigured } from './supabase'
import type { Playlist, Track } from '@/types'
import { demoPlaylists, demoTracks } from '@/data/demoTracks'

export interface HistoryEntry {
  id: string
  track_id: string
  track?: Track
  played_at: string
  duration_listened_ms: number
  completed: boolean
}

// In-memory demo collections store when Supabase is unconfigured
let localPlaylists: Playlist[] = [...demoPlaylists]
let localPlaylistTracks: Record<string, Track[]> = {
  'pl-1': [demoTracks[0], demoTracks[2]],
  'pl-2': [demoTracks[1], demoTracks[3]]
}
let localFavoriteIds = new Set<string>(['demo-1', 'demo-3'])
let localHistory: HistoryEntry[] = [
  {
    id: 'hist-1',
    track_id: 'demo-1',
    track: demoTracks[0],
    played_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    duration_listened_ms: 215000,
    completed: true
  },
  {
    id: 'hist-2',
    track_id: 'demo-3',
    track: demoTracks[2],
    played_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    duration_listened_ms: 272000,
    completed: true
  }
]

export const collectionsService = {
  // ==========================================
  // PLAYLISTS
  // ==========================================

  async fetchPlaylists(ownerId: string): Promise<Playlist[]> {
    if (!isSupabaseConfigured()) {
      return [...localPlaylists]
    }

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          id, owner_id, title, description, cover_storage_path, created_at, updated_at,
          playlist_tracks(count)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        owner_id: row.owner_id,
        title: row.title,
        description: row.description,
        track_count: row.playlist_tracks?.[0]?.count || 0,
        created_at: row.created_at,
        updated_at: row.updated_at
      }))
    } catch (err) {
      console.error('[CollectionsService] fetchPlaylists error:', err)
      return [...localPlaylists]
    }
  },

  async createPlaylist(ownerId: string, title: string, description?: string): Promise<Playlist> {
    const trimmedTitle = title.trim() || 'قائمة تشغيل جديدة'

    if (!isSupabaseConfigured()) {
      const newPl: Playlist = {
        id: 'pl-' + Math.random().toString(36).substring(2, 8),
        owner_id: ownerId,
        title: trimmedTitle,
        description: description?.trim(),
        track_count: 0,
        created_at: new Date().toISOString()
      }
      localPlaylists.unshift(newPl)
      localPlaylistTracks[newPl.id] = []
      return newPl
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        owner_id: ownerId,
        title: trimmedTitle,
        description: description?.trim()
      })
      .select('id, owner_id, title, description, created_at, updated_at')
      .single()

    if (error) throw error

    return {
      id: data.id,
      owner_id: data.owner_id,
      title: data.title,
      description: data.description,
      track_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  },

  async updatePlaylist(id: string, updates: { title?: string; description?: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const idx = localPlaylists.findIndex(p => p.id === id)
      if (idx !== -1) {
        localPlaylists[idx] = { ...localPlaylists[idx], ...updates, updated_at: new Date().toISOString() }
        return true
      }
      return false
    }

    const { error } = await supabase
      .from('playlists')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return !error
  },

  async deletePlaylist(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      localPlaylists = localPlaylists.filter(p => p.id !== id)
      delete localPlaylistTracks[id]
      return true
    }

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)

    return !error
  },

  async fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
    if (!isSupabaseConfigured()) {
      return localPlaylistTracks[playlistId] || []
    }

    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          position,
          track:tracks(
            id, owner_id, title, track_number, release_year, duration_ms,
            storage_path, cover_storage_path, content_hash,
            artist:artists(id, name),
            album:albums(id, title)
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.track.id,
        owner_id: row.track.owner_id,
        title: row.track.title,
        artist_id: row.track.artist?.id,
        artist_name: row.track.artist?.name || 'فنان غير معروف',
        album_id: row.track.album?.id,
        album_title: row.track.album?.title || 'مفردات',
        track_number: row.track.track_number,
        release_year: row.track.release_year,
        duration_ms: row.track.duration_ms,
        storage_path: row.track.storage_path,
        cover_storage_path: row.track.cover_storage_path
      }))
    } catch (err) {
      console.error('[CollectionsService] fetchPlaylistTracks error:', err)
      return localPlaylistTracks[playlistId] || []
    }
  },

  async addTrackToPlaylist(playlistId: string, track: Track): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (!localPlaylistTracks[playlistId]) localPlaylistTracks[playlistId] = []
      if (!localPlaylistTracks[playlistId].some(t => t.id === track.id)) {
        localPlaylistTracks[playlistId].push(track)
        const pl = localPlaylists.find(p => p.id === playlistId)
        if (pl) pl.track_count = (pl.track_count || 0) + 1
      }
      return true
    }

    // Get current max position
    const { count } = await supabase
      .from('playlist_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('playlist_id', playlistId)

    const nextPos = (count || 0) + 1

    const { error } = await supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id: track.id,
        position: nextPos
      })

    return !error
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (localPlaylistTracks[playlistId]) {
        localPlaylistTracks[playlistId] = localPlaylistTracks[playlistId].filter(t => t.id !== trackId)
        const pl = localPlaylists.find(p => p.id === playlistId)
        if (pl && pl.track_count && pl.track_count > 0) pl.track_count--
      }
      return true
    }

    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId)

    return !error
  },

  // ==========================================
  // FAVORITES
  // ==========================================

  async fetchFavorites(ownerId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(localFavoriteIds)
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('track_id')
        .eq('owner_id', ownerId)

      if (error) throw error
      return (data || []).map((row: any) => row.track_id)
    } catch (err) {
      console.error('[CollectionsService] fetchFavorites error:', err)
      return Array.from(localFavoriteIds)
    }
  },

  async toggleFavorite(ownerId: string, trackId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (localFavoriteIds.has(trackId)) {
        localFavoriteIds.delete(trackId)
        return false // now unfavorited
      } else {
        localFavoriteIds.add(trackId)
        return true // now favorited
      }
    }

    // Check if favorite exists
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('track_id', trackId)
      .maybeSingle()

    if (existing?.id) {
      // Remove
      await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id)
      return false
    } else {
      // Add
      await supabase
        .from('favorites')
        .insert({
          owner_id: ownerId,
          track_id: trackId
        })
      return true
    }
  },

  // ==========================================
  // LISTENING HISTORY & RECENTLY PLAYED
  // ==========================================

  async logPlayback(ownerId: string, trackId: string, durationMs: number, completed: boolean, deviceId = 'local-device'): Promise<void> {
    if (!isSupabaseConfigured()) {
      const track = demoTracks.find(t => t.id === trackId)
      localHistory.unshift({
        id: 'hist-' + Math.random().toString(36).substring(2, 8),
        track_id: trackId,
        track,
        played_at: new Date().toISOString(),
        duration_listened_ms: durationMs,
        completed
      })
      return
    }

    try {
      await supabase
        .from('listening_history')
        .insert({
          owner_id: ownerId,
          track_id: trackId,
          device_id: deviceId,
          duration_listened_ms: durationMs,
          completed
        })
    } catch (err) {
      console.warn('[CollectionsService] logPlayback error:', err)
    }
  },

  async fetchHistory(ownerId: string, limit = 50): Promise<HistoryEntry[]> {
    if (!isSupabaseConfigured()) {
      return localHistory.slice(0, limit)
    }

    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select(`
          id, track_id, played_at, duration_listened_ms, completed,
          track:tracks(
            id, title, duration_ms, storage_path, cover_storage_path,
            artist:artists(id, name),
            album:albums(id, title)
          )
        `)
        .eq('owner_id', ownerId)
        .order('played_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        track_id: row.track_id,
        played_at: row.played_at,
        duration_listened_ms: row.duration_listened_ms,
        completed: row.completed,
        track: row.track ? {
          id: row.track.id,
          title: row.track.title,
          artist_name: row.track.artist?.name || 'فنان غير معروف',
          album_title: row.track.album?.title || 'مفردات',
          duration_ms: row.track.duration_ms,
          storage_path: row.track.storage_path
        } : undefined
      }))
    } catch (err) {
      console.error('[CollectionsService] fetchHistory error:', err)
      return localHistory.slice(0, limit)
    }
  }
}
