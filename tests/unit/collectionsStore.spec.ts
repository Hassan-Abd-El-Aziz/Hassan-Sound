import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionsStore } from '@/stores/collections'
import type { Track } from '@/types'

const testTrack: Track = {
  id: 'coll-track-1',
  title: 'Collection Track',
  artist_name: 'Collection Artist',
  duration_ms: 195000,
  storage_path: 'tracks/coll-1.mp3'
}

describe('Collections Store (Playlists, Favorites, History)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads playlists and creates a new playlist', async () => {
    const collections = useCollectionsStore()
    await collections.loadPlaylists()

    const initialCount = collections.playlists.length
    const created = await collections.createPlaylist('Chill Vibes', 'Relaxing collection')

    expect(created.title).toBe('Chill Vibes')
    expect(collections.playlists.length).toBe(initialCount + 1)
  })

  it('manages playlist tracks (add and remove)', async () => {
    const collections = useCollectionsStore()
    const pl = await collections.createPlaylist('Study Time')

    const added = await collections.addTrackToPlaylist(pl.id, testTrack)
    expect(added).toBe(true)

    const tracks = await collections.loadPlaylistTracks(pl.id)
    expect(tracks.some(t => t.id === 'coll-track-1')).toBe(true)

    const removed = await collections.removeTrackFromPlaylist(pl.id, 'coll-track-1')
    expect(removed).toBe(true)
    expect(collections.activePlaylistTracks.some(t => t.id === 'coll-track-1')).toBe(false)
  })

  it('toggles favorites reactively', async () => {
    const collections = useCollectionsStore()
    await collections.loadFavorites()

    const wasFav = collections.isFavorite(testTrack.id)
    const isNowFav = await collections.toggleFavorite(testTrack)

    expect(isNowFav).toBe(!wasFav)
    expect(collections.isFavorite(testTrack.id)).toBe(!wasFav)

    // Toggle back
    const toggledBack = await collections.toggleFavorite(testTrack)
    expect(toggledBack).toBe(wasFav)
  })

  it('records listening history and tracks recently played', async () => {
    const collections = useCollectionsStore()
    await collections.recordPlayback(testTrack, 195000, true)

    expect(collections.history.length).toBeGreaterThan(0)
    expect(collections.history[0].track_id).toBe('coll-track-1')
  })
})
