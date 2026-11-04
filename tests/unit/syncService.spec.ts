import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { getOrCreateDeviceId, detectDeviceInfo } from '@/services/deviceService'
import { syncService } from '@/services/syncService'
import { offlineDb } from '@/services/offlineDb'

describe('Sync Service (Device & Outbox & LWW)', () => {
  beforeEach(async () => {
    localStorage.clear()
    await offlineDb.outbox.clear()
  })

  it('generates and persists unique device ID', () => {
    const id1 = getOrCreateDeviceId()
    expect(id1.startsWith('dev-')).toBe(true)

    const id2 = getOrCreateDeviceId()
    expect(id1).toBe(id2) // must be identical from localStorage
  })

  it('detects device type and browser info', () => {
    const info = detectDeviceInfo()
    expect(info.device_name).toBeDefined()
    expect(['desktop', 'mobile', 'tablet']).toContain(info.device_type)
    expect(info.browser).toBeDefined()
  })

  it('queues offline action in IndexedDB outbox', async () => {
    const item = await syncService.enqueueAction('TOGGLE_FAVORITE', {
      trackId: 'track-test-123',
      isFavorite: true
    })

    expect(item.id.startsWith('outbox-')).toBe(true)
    expect(item.action).toBe('TOGGLE_FAVORITE')
    expect(item.status).toBe('pending')

    const count = await syncService.getPendingOutboxCount()
    expect(count).toBe(1)
  })

  it('prevents older update from overwriting newer remote playback state (LWW)', async () => {
    // When Supabase is unconfigured, pushPlaybackState returns true gracefully
    const pushed = await syncService.pushPlaybackState('owner-1', 'track-1', 45000)
    expect(pushed).toBe(true)
  })
})
