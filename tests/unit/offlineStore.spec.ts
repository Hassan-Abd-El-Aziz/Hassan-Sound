import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOfflineStore } from '@/stores/offline'
import type { Track } from '@/types'

const sampleTrack: Track = {
  id: 'off-track-1',
  title: 'Offline Song Test',
  artist_name: 'Offline Artist',
  duration_ms: 180000,
  storage_path: 'tracks/off-1.mp3'
}

describe('Offline Store (IndexedDB & Downloads)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
  })

  it('checks storage estimate numbers', async () => {
    const offline = useOfflineStore()
    await offline.checkStorage()

    expect(typeof offline.storageUsageMB).toBe('number')
    expect(typeof offline.storageQuotaMB).toBe('number')
    expect(typeof offline.isPersisted).toBe('boolean')
  })

  it('downloads a track and marks it as downloaded', async () => {
    const offline = useOfflineStore()
    const success = await offline.downloadTrack(sampleTrack)

    expect(success).toBe(true)
    expect(sampleTrack.download_status).toBe('downloaded')
    expect(offline.downloadedTracks.some(t => t.id === 'off-track-1')).toBe(true)
    expect(offline.isTrackDownloaded('off-track-1')).toBe(true)
  })

  it('retrieves offline audio blob for downloaded track', async () => {
    const offline = useOfflineStore()
    await offline.downloadTrack(sampleTrack)

    const blob = await offline.getOfflineAudioBlob('off-track-1')
    expect(blob).not.toBeNull()
    expect(blob).toBeDefined()
  })

  it('removes local download without affecting cloud', async () => {
    const offline = useOfflineStore()
    await offline.downloadTrack(sampleTrack)
    expect(offline.isTrackDownloaded('off-track-1')).toBe(true)

    const removed = await offline.removeDownload('off-track-1')
    expect(removed).toBe(true)
    expect(offline.isTrackDownloaded('off-track-1')).toBe(false)
  })

  it('clears all local downloads on this device', async () => {
    const offline = useOfflineStore()
    await offline.downloadTrack(sampleTrack)
    expect(offline.downloadedTracks.length).toBeGreaterThan(0)

    const cleared = await offline.clearAllDownloads()
    expect(cleared).toBe(true)
    expect(offline.downloadedTracks.length).toBe(0)
  })
})
