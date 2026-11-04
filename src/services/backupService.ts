import type { Artist, Album } from '@/types'
import { catalogService } from './catalogService'
import { collectionsService } from './collectionsService'

export interface LibraryManifest {
  manifest_version: string
  app_name: string
  exported_at: string
  owner_id: string
  summary: {
    tracks_count: number
    artists_count: number
    albums_count: number
    playlists_count: number
    favorites_count: number
  }
  artists: Artist[]
  albums: Album[]
  tracks: Array<{
    id: string
    title: string
    artist_name?: string
    album_title?: string
    duration_ms: number
    storage_path: string
    cover_storage_path?: string
    content_hash?: string
    release_year?: number
    track_number?: number
  }>
  playlists: Array<{
    id: string
    title: string
    description?: string
    track_ids: string[]
  }>
  favorites: string[] // track ids
}

export const backupService = {
  /**
   * Exports full metadata manifest as a structured JSON object.
   */
  async generateManifest(ownerId: string): Promise<LibraryManifest> {
    const { tracks } = await catalogService.fetchTracks({ pageSize: 1000 })
    const playlists = await collectionsService.fetchPlaylists(ownerId)
    const favorites = await collectionsService.fetchFavorites(ownerId)

    // Collect tracks for each playlist
    const populatedPlaylists = await Promise.all(
      playlists.map(async (pl) => {
        const pTracks = await collectionsService.fetchPlaylistTracks(pl.id)
        return {
          id: pl.id,
          title: pl.title,
          description: pl.description,
          track_ids: pTracks.map(t => t.id)
        }
      })
    )

    // Extract unique artists & albums
    const artistMap = new Map<string, Artist>()
    const albumMap = new Map<string, Album>()

    tracks.forEach(tr => {
      if (tr.artist_name && !artistMap.has(tr.artist_name)) {
        artistMap.set(tr.artist_name, { id: tr.artist_id || 'art-' + tr.artist_name, name: tr.artist_name })
      }
      if (tr.album_title && !albumMap.has(tr.album_title)) {
        albumMap.set(tr.album_title, {
          id: tr.album_id || 'alb-' + tr.album_title,
          title: tr.album_title,
          artist_name: tr.artist_name,
          release_year: tr.release_year
        })
      }
    })

    const manifest: LibraryManifest = {
      manifest_version: '1.0',
      app_name: 'MySound',
      exported_at: new Date().toISOString(),
      owner_id: ownerId,
      summary: {
        tracks_count: tracks.length,
        artists_count: artistMap.size,
        albums_count: albumMap.size,
        playlists_count: playlists.length,
        favorites_count: favorites.length
      },
      artists: Array.from(artistMap.values()),
      albums: Array.from(albumMap.values()),
      tracks: tracks.map(tr => ({
        id: tr.id,
        title: tr.title,
        artist_name: tr.artist_name,
        album_title: tr.album_title,
        duration_ms: tr.duration_ms,
        storage_path: tr.storage_path,
        cover_storage_path: tr.cover_storage_path,
        content_hash: tr.content_hash,
        release_year: tr.release_year,
        track_number: tr.track_number
      })),
      playlists: populatedPlaylists,
      favorites: favorites
    }

    return manifest
  },

  /**
   * Triggers browser download of the generated JSON manifest.
   */
  downloadManifestFile(manifest: LibraryManifest): void {
    if (typeof window === 'undefined') return
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `mysound-manifest-${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /**
   * Validates and imports a JSON manifest string.
   */
  async importManifest(ownerId: string, jsonContent: string): Promise<{ success: boolean; tracksImported: number; message: string }> {
    let parsed: any
    try {
      parsed = JSON.parse(jsonContent)
    } catch {
      return { success: false, tracksImported: 0, message: 'ملف JSON غير صالح أو تالف' }
    }

    if (!parsed.manifest_version || !Array.isArray(parsed.tracks)) {
      return { success: false, tracksImported: 0, message: 'بنية ملف الـ Manifest غير متوافقة مع MySound' }
    }

    let tracksImported = 0

    // Import tracks
    for (const tr of parsed.tracks) {
      try {
        await catalogService.createTrack(ownerId, {
          title: tr.title,
          artist_name: tr.artist_name || 'فنان غير معروف',
          album_title: tr.album_title || 'مفردات',
          duration_ms: tr.duration_ms || 180000,
          storage_path: tr.storage_path || `tracks/${tr.id}.mp3`,
          cover_storage_path: tr.cover_storage_path,
          content_hash: tr.content_hash,
          track_number: tr.track_number,
          release_year: tr.release_year
        })
        tracksImported++
      } catch (e) {
        console.warn('[BackupService] Track import skip:', e)
      }
    }

    // Import playlists
    if (Array.isArray(parsed.playlists)) {
      for (const pl of parsed.playlists) {
        try {
          await collectionsService.createPlaylist(ownerId, pl.title, pl.description)
        } catch {}
      }
    }

    return {
      success: true,
      tracksImported,
      message: `تم استيراد ${tracksImported} مسار بنجاح إلى مكتبتك.`
    }
  }
}
