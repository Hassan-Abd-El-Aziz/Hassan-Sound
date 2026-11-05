import { supabase, isSupabaseConfigured, storageService } from './supabase'
import { offlineDb } from './offlineDb'
import type { Track, Artist, Album } from '@/types'
import { demoTracks, demoArtists, demoAlbums } from '@/data/demoTracks'

export interface FetchOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'title' | 'artist' | 'album' | 'duration' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  genre?: string
  artistId?: string
  albumId?: string
}

export interface FetchResult {
  tracks: Track[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// In-memory demo store fallback when Supabase is unconfigured
let localTracks: Track[] = [...demoTracks]
let localArtists: Artist[] = [...demoArtists]
let localAlbums: Album[] = [...demoAlbums]
let staticTracksLoaded = false

export const catalogService = {
  /**
   * Fetches paginated tracks with search, sorting, and filters.
   */
  async fetchTracks(options: FetchOptions = {}): Promise<FetchResult> {
    const page = options.page || 1
    const pageSize = options.pageSize || 20
    const sortBy = options.sortBy || 'title'
    const sortOrder = options.sortOrder || 'asc'
    const search = options.search?.toLowerCase().trim() || ''

    if (!isSupabaseConfigured()) {
      // 1. Load static git repository tracks from tracks.json if available
      if (!staticTracksLoaded && typeof window !== 'undefined' && !import.meta.env.VITEST) {
        try {
          const rawBase = import.meta.env.BASE_URL || '/'
          const baseUrl = rawBase.endsWith('/') ? rawBase : rawBase + '/'
          const res = await fetch(`${baseUrl}tracks.json`)
          if (res.ok) {
            const gitTracks: Track[] = await res.json()
            if (Array.isArray(gitTracks) && gitTracks.length > 0) {
              // Replace placeholder demo tracks with user's real tracks
              localTracks = localTracks.filter(t => !t.id.startsWith('demo-'))
              for (const gt of gitTracks) {
                if (!localTracks.some(t => t.id === gt.id)) {
                  localTracks.push({
                    ...gt,
                    storage_path: gt.storage_path.startsWith('http')
                      ? gt.storage_path
                      : `${baseUrl}${gt.storage_path.replace(/^\.?\//, '')}`,
                    cover_url: gt.cover_url
                      ? `${baseUrl}${gt.cover_url.replace(/^\.?\//, '')}`
                      : undefined
                  })
                }
              }
            }
          }
          staticTracksLoaded = true
        } catch (e) {
          console.warn('[CatalogService] Could not fetch static tracks.json:', e)
        }
      }

      if (typeof indexedDB !== 'undefined') {
        try {
          const offlineRecords = await offlineDb.tracks.toArray()
          for (const rec of offlineRecords) {
            if (!localTracks.some(t => t.id === rec.id)) {
              localTracks.unshift({
                id: rec.id,
                title: rec.title,
                artist_name: rec.artist_name || 'فنان غير معروف',
                album_title: rec.album_title || 'مفردات',
                duration_ms: rec.duration_ms,
                file_size_bytes: rec.file_size_bytes,
                storage_path: 'offline://' + rec.id,
                content_hash: rec.content_hash,
                download_status: 'downloaded',
                cover_url: rec.cover_blob ? URL.createObjectURL(rec.cover_blob) : undefined,
                created_at: rec.downloaded_at
              })
            }
          }
        } catch (e) {
          console.warn('[CatalogService] Could not sync offline tracks:', e)
        }
      }

      let filtered = [...localTracks]

      if (search) {
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(search) ||
          (t.artist_name && t.artist_name.toLowerCase().includes(search)) ||
          (t.album_title && t.album_title.toLowerCase().includes(search))
        )
      }

      if (options.genre) {
        filtered = filtered.filter(t => t.genre_name === options.genre)
      }
      if (options.artistId) {
        filtered = filtered.filter(t => t.artist_id === options.artistId)
      }
      if (options.albumId) {
        filtered = filtered.filter(t => t.album_id === options.albumId)
      }

      filtered.sort((a, b) => {
        let valA: any = a.title
        let valB: any = b.title

        if (sortBy === 'artist') {
          valA = a.artist_name || ''
          valB = b.artist_name || ''
        } else if (sortBy === 'album') {
          valA = a.album_title || ''
          valB = b.album_title || ''
        } else if (sortBy === 'duration') {
          valA = a.duration_ms
          valB = b.duration_ms
        } else if (sortBy === 'created_at') {
          valA = a.created_at || ''
          valB = b.created_at || ''
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })

      const totalCount = filtered.length
      const from = (page - 1) * pageSize
      const paged = filtered.slice(from, from + pageSize)

      return {
        tracks: paged,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize) || 1
      }
    }

    try {
      let query = supabase
        .from('tracks')
        .select(`
          id, owner_id, title, track_number, release_year, duration_ms,
          mime_type, file_extension, file_size_bytes, bitrate, sample_rate,
          storage_path, cover_storage_path, content_hash, created_at, updated_at,
          artist:artists(id, name),
          album:albums(id, title, cover_storage_path),
          genre:genres(id, name)
        `, { count: 'exact' })

      if (search) {
        query = query.or(`title.ilike.%${search}%,storage_path.ilike.%${search}%`)
      }

      if (options.genre) {
        query = query.eq('genre_id', options.genre)
      }
      if (options.artistId) {
        query = query.eq('artist_id', options.artistId)
      }
      if (options.albumId) {
        query = query.eq('album_id', options.albumId)
      }

      const isAsc = sortOrder === 'asc'
      if (sortBy === 'title') query = query.order('title', { ascending: isAsc })
      else if (sortBy === 'duration') query = query.order('duration_ms', { ascending: isAsc })
      else if (sortBy === 'created_at') query = query.order('created_at', { ascending: isAsc })
      else query = query.order('title', { ascending: true })

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      if (error) throw error

      // Transform joined tables to clean Track interfaces
      const mappedTracks: Track[] = (data || []).map((row: any) => ({
        id: row.id,
        owner_id: row.owner_id,
        title: row.title,
        artist_id: row.artist?.id,
        artist_name: row.artist?.name || 'فنان غير معروف',
        album_id: row.album?.id,
        album_title: row.album?.title || 'مفردات',
        genre_id: row.genre?.id,
        genre_name: row.genre?.name,
        track_number: row.track_number,
        release_year: row.release_year,
        duration_ms: row.duration_ms,
        mime_type: row.mime_type,
        file_extension: row.file_extension,
        file_size_bytes: row.file_size_bytes,
        bitrate: row.bitrate,
        sample_rate: row.sample_rate,
        storage_path: row.storage_path,
        cover_storage_path: row.cover_storage_path || row.album?.cover_storage_path,
        content_hash: row.content_hash,
        created_at: row.created_at,
        updated_at: row.updated_at
      }))

      // Resolve signed cover URLs
      for (const tr of mappedTracks) {
        if (tr.cover_storage_path) {
          const { url } = await storageService.getSignedCoverUrl(tr.cover_storage_path)
          if (url) tr.cover_url = url
        }
      }

      const totalCount = count || mappedTracks.length
      return {
        tracks: mappedTracks,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize) || 1
      }
    } catch (err) {
      console.error('[CatalogService] fetchTracks error:', err)
      return {
        tracks: localTracks,
        totalCount: localTracks.length,
        page: 1,
        pageSize,
        totalPages: 1
      }
    }
  },

  /**
   * Finds or creates an artist for the owner to prevent duplicates.
   */
  async findOrCreateArtist(ownerId: string, name: string): Promise<string> {
    const trimmed = name.trim() || 'فنان غير معروف'
    if (!isSupabaseConfigured()) {
      let existing = localArtists.find(a => a.name.toLowerCase() === trimmed.toLowerCase())
      if (!existing) {
        existing = { id: 'art-' + Math.random().toString(36).substring(2, 8), name: trimmed, track_count: 1 }
        localArtists.push(existing)
      }
      return existing.id
    }

    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('name', trimmed)
      .maybeSingle()

    if (existing?.id) {
      return existing.id
    }

    const { data: created, error } = await supabase
      .from('artists')
      .insert({ owner_id: ownerId, name: trimmed })
      .select('id')
      .single()

    if (error) throw error
    return created.id
  },

  /**
   * Finds or creates an album for the owner & artist.
   */
  async findOrCreateAlbum(ownerId: string, title: string, artistId?: string, year?: number, coverPath?: string): Promise<string> {
    const trimmed = title.trim() || 'مفردات'
    if (!isSupabaseConfigured()) {
      let existing = localAlbums.find(a => a.title.toLowerCase() === trimmed.toLowerCase())
      if (!existing) {
        existing = {
          id: 'alb-' + Math.random().toString(36).substring(2, 8),
          title: trimmed,
          artist_id: artistId,
          release_year: year,
          track_count: 1
        }
        localAlbums.push(existing)
      }
      return existing.id
    }

    let query = supabase
      .from('albums')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('title', trimmed)

    if (artistId) query = query.eq('artist_id', artistId)

    const { data: existing } = await query.maybeSingle()
    if (existing?.id) return existing.id

    const { data: created, error } = await supabase
      .from('albums')
      .insert({
        owner_id: ownerId,
        title: trimmed,
        artist_id: artistId,
        release_year: year,
        cover_storage_path: coverPath
      })
      .select('id')
      .single()

    if (error) throw error
    return created.id
  },

  /**
   * Checks if a track with the same content hash already exists.
   */
  async checkDuplicateHash(hash: string): Promise<Track | null> {
    if (!hash) return null
    if (!isSupabaseConfigured()) {
      const memoryMatch = localTracks.find(t => t.content_hash === hash)
      if (memoryMatch) return memoryMatch
      if (typeof indexedDB !== 'undefined') {
        try {
          const offlineMatch = await offlineDb.tracks.where('content_hash').equals(hash).first()
          if (offlineMatch) {
            return {
              id: offlineMatch.id,
              title: offlineMatch.title,
              artist_name: offlineMatch.artist_name,
              album_title: offlineMatch.album_title,
              duration_ms: offlineMatch.duration_ms,
              file_size_bytes: offlineMatch.file_size_bytes,
              storage_path: 'offline://' + offlineMatch.id,
              content_hash: offlineMatch.content_hash
            }
          }
        } catch {}
      }
      return null
    }

    const { data } = await supabase
      .from('tracks')
      .select('id, title, storage_path')
      .eq('content_hash', hash)
      .maybeSingle()

    return data as Track | null
  },

  /**
   * Creates a complete track record with artist and album relations.
   */
  async createTrack(ownerId: string, trackData: Omit<Track, 'id'>): Promise<Track> {
    const artistId = await this.findOrCreateArtist(ownerId, trackData.artist_name || 'فنان غير معروف')
    const albumId = await this.findOrCreateAlbum(ownerId, trackData.album_title || 'مفردات', artistId, trackData.release_year, trackData.cover_storage_path)

    if (!isSupabaseConfigured()) {
      const newTrack: Track = {
        ...trackData,
        id: 'track-' + Math.random().toString(36).substring(2, 9),
        artist_id: artistId,
        album_id: albumId,
        created_at: new Date().toISOString()
      }
      localTracks.unshift(newTrack)
      return newTrack
    }

    const { data, error } = await supabase
      .from('tracks')
      .insert({
        owner_id: ownerId,
        title: trackData.title,
        artist_id: artistId,
        album_id: albumId,
        track_number: trackData.track_number || 1,
        release_year: trackData.release_year,
        duration_ms: trackData.duration_ms,
        mime_type: trackData.mime_type,
        file_extension: trackData.file_extension,
        file_size_bytes: trackData.file_size_bytes,
        bitrate: trackData.bitrate,
        sample_rate: trackData.sample_rate,
        storage_path: trackData.storage_path,
        cover_storage_path: trackData.cover_storage_path,
        content_hash: trackData.content_hash
      })
      .select(`
        id, owner_id, title, track_number, release_year, duration_ms,
        mime_type, file_extension, file_size_bytes, bitrate, sample_rate,
        storage_path, cover_storage_path, content_hash, created_at,
        artist:artists(id, name),
        album:albums(id, title)
      `)
      .single()

    if (error) throw error

    const rawData: any = data
    const artist = Array.isArray(rawData.artist) ? rawData.artist[0] : rawData.artist
    const album = Array.isArray(rawData.album) ? rawData.album[0] : rawData.album

    return {
      id: rawData.id,
      owner_id: rawData.owner_id,
      title: rawData.title,
      artist_id: artist?.id,
      artist_name: artist?.name,
      album_id: album?.id,
      album_title: album?.title,
      track_number: rawData.track_number,
      release_year: rawData.release_year,
      duration_ms: rawData.duration_ms,
      mime_type: rawData.mime_type,
      file_extension: rawData.file_extension,
      file_size_bytes: rawData.file_size_bytes,
      bitrate: rawData.bitrate,
      sample_rate: rawData.sample_rate,
      storage_path: rawData.storage_path,
      cover_storage_path: rawData.cover_storage_path,
      cover_url: trackData.cover_url,
      content_hash: data.content_hash,
      created_at: data.created_at
    }
  },

  /**
   * Updates an existing track's metadata.
   */
  async updateTrack(id: string, updates: Partial<Track>): Promise<boolean> {
    if (typeof indexedDB !== 'undefined') {
      try {
        const rec = await offlineDb.tracks.get(id)
        if (rec) {
          if (updates.title) rec.title = updates.title
          if (updates.artist_name) rec.artist_name = updates.artist_name
          if (updates.album_title) rec.album_title = updates.album_title
          await offlineDb.tracks.put(rec)
        }
      } catch {}
    }

    if (!isSupabaseConfigured()) {
      let idx = localTracks.findIndex(t => t.id === id)
      if (idx === -1) {
        localTracks.push({ id, ...updates } as any)
        idx = localTracks.length - 1
      }
      localTracks[idx] = { ...localTracks[idx], ...updates, updated_at: new Date().toISOString() }
      return true
    }

    const { error } = await supabase
      .from('tracks')
      .update({
        title: updates.title,
        track_number: updates.track_number,
        release_year: updates.release_year,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return !error
  },

  /**
   * Deletes a track from the database and optionally removes storage files.
   */
  async deleteTrack(track: Track): Promise<boolean> {
    if (typeof indexedDB !== 'undefined') {
      try {
        await offlineDb.tracks.delete(track.id)
      } catch {}
    }

    if (!isSupabaseConfigured()) {
      localTracks = localTracks.filter(t => t.id !== track.id)
      return true
    }

    try {
      // 1. Delete from tracks table
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', track.id)

      if (error) throw error

      // 2. Remove audio file from private storage
      if (track.storage_path) {
        await supabase.storage.from('audio').remove([track.storage_path])
      }

      // 3. Remove cover file if it exists and is specific to track
      if (track.cover_storage_path) {
        await supabase.storage.from('covers').remove([track.cover_storage_path])
      }

      return true
    } catch (err) {
      console.error('[CatalogService] Delete error:', err)
      return false
    }
  }
}
