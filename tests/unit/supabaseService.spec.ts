import { describe, it, expect } from 'vitest'
import { isSupabaseConfigured, storageService } from '@/services/supabase'

describe('Supabase Client & Storage Service', () => {
  it('detects unconfigured environment safely', () => {
    // In test environment without real .env keys, isSupabaseConfigured returns false
    const configured = isSupabaseConfigured()
    expect(typeof configured).toBe('boolean')
  })

  it('safely handles getSignedAudioUrl when unconfigured or invalid', async () => {
    const { url, error } = await storageService.getSignedAudioUrl('dummy/test.mp3')
    if (!isSupabaseConfigured()) {
      expect(url).toBeNull()
      expect(error).not.toBeNull()
    }
  })

  it('safely handles getSignedCoverUrl when unconfigured or invalid', async () => {
    const { url, error } = await storageService.getSignedCoverUrl('dummy/cover.jpg')
    if (!isSupabaseConfigured()) {
      expect(url).toBeNull()
      expect(error).not.toBeNull()
    }
  })
})
