import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'
import type { Track } from '@/types'

const sampleTrack: Track = {
  id: 'cat-test-1',
  title: 'Catalog Song',
  artist_name: 'Catalog Artist',
  album_title: 'Catalog Album',
  duration_ms: 210000,
  storage_path: 'tracks/cat-test-1.mp3'
}

describe('Catalog Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches tracks and updates state', async () => {
    const catalog = useCatalogStore()
    await catalog.fetchTracks(1)

    expect(catalog.tracks.length).toBeGreaterThan(0)
    expect(catalog.totalTracks).toBeGreaterThan(0)
    expect(catalog.isLoading).toBe(false)
  })

  it('adds a new track to the top of the catalog', () => {
    const catalog = useCatalogStore()
    const initialCount = catalog.tracks.length
    catalog.addTrack(sampleTrack)

    expect(catalog.tracks.length).toBe(initialCount + 1)
    expect(catalog.tracks[0].id).toBe('cat-test-1')
  })

  it('updates metadata of an existing track', async () => {
    const catalog = useCatalogStore()
    catalog.addTrack(sampleTrack)

    const updated = await catalog.updateTrack('cat-test-1', {
      title: 'Renamed Catalog Song'
    })

    expect(updated).toBe(true)
    expect(catalog.tracks[0].title).toBe('Renamed Catalog Song')
  })

  it('deletes a track from the catalog', async () => {
    const catalog = useCatalogStore()
    catalog.addTrack(sampleTrack)
    expect(catalog.tracks.some(t => t.id === 'cat-test-1')).toBe(true)

    const deleted = await catalog.deleteTrack(sampleTrack)
    expect(deleted).toBe(true)
    expect(catalog.tracks.some(t => t.id === 'cat-test-1')).toBe(false)
  })
})
