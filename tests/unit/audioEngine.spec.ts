import { describe, it, expect, beforeEach } from 'vitest'
import { AudioEngine } from '@/services/audioEngine'
import type { Track } from '@/types'

const dummyTrack: Track = {
  id: 'eng-1',
  title: 'Engine Test Track',
  artist_name: 'Sound Master',
  duration_ms: 180000,
  storage_path: 'tracks/test.mp3'
}

describe('AudioEngine Singleton', () => {
  let engine: AudioEngine

  beforeEach(() => {
    localStorage.clear()
    engine = AudioEngine.getInstance()
  })

  it('guarantees a single instance', () => {
    const instance2 = AudioEngine.getInstance()
    expect(engine).toBe(instance2)
  })

  it('subscribes to and unbinds events', () => {
    let triggered = false
    const unsub = engine.on((event) => {
      if (event === 'test_event') triggered = true
    })

    // Private emit simulation by triggering event
    ;(engine as any).emit('test_event')
    expect(triggered).toBe(true)

    triggered = false
    unsub()
    ;(engine as any).emit('test_event')
    expect(triggered).toBe(false)
  })

  it('manages volume and muting', () => {
    engine.setVolume(0.6)
    expect(engine.audio.volume).toBe(0.6)

    engine.setMuted(true)
    expect(engine.audio.muted).toBe(true)

    engine.setMuted(false)
    expect(engine.audio.muted).toBe(false)
  })

  it('saves and restores playback position', () => {
    ;(engine as any).currentTrack = dummyTrack
    engine.audio.currentTime = 45
    engine.savePosition()

    const saved = engine.getSavedPosition()
    expect(saved).not.toBeNull()
    expect(saved?.track.id).toBe('eng-1')
    expect(saved?.positionSeconds).toBe(45)
  })
})
