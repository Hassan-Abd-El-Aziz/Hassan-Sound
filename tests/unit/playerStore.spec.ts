import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import type { Track } from '@/types'

const sampleTrack1: Track = {
  id: 'test-1',
  title: 'Test Song 1',
  artist_name: 'Artist 1',
  duration_ms: 200000,
  storage_path: 'tracks/test-1.mp3'
}

const sampleTrack2: Track = {
  id: 'test-2',
  title: 'Test Song 2',
  artist_name: 'Artist 2',
  duration_ms: 150000,
  storage_path: 'tracks/test-2.mp3'
}

describe('Player Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const player = usePlayerStore()
    expect(player.isPlaying).toBe(false)
    expect(player.currentTrack).toBeNull()
    expect(player.currentTime).toBe(0)
    expect(player.queue).toEqual([])
    expect(player.repeatMode).toBe('off')
    expect(player.shuffle).toBe(false)
  })

  it('plays a track and updates queue', () => {
    const player = usePlayerStore()
    player.playTrack(sampleTrack1, [sampleTrack1, sampleTrack2])

    expect(player.isPlaying).toBe(true)
    expect(player.currentTrack?.id).toBe('test-1')
    expect(player.queue.length).toBe(2)
    expect(player.queueIndex).toBe(0)
    expect(player.duration).toBe(200)
  })

  it('toggles play and pause', () => {
    const player = usePlayerStore()
    player.playTrack(sampleTrack1)
    expect(player.isPlaying).toBe(true)

    player.togglePlay()
    expect(player.isPlaying).toBe(false)

    player.togglePlay()
    expect(player.isPlaying).toBe(true)
  })

  it('navigates next and prev tracks in queue', () => {
    const player = usePlayerStore()
    player.playTrack(sampleTrack1, [sampleTrack1, sampleTrack2])
    expect(player.queueIndex).toBe(0)

    player.nextTrack()
    expect(player.queueIndex).toBe(1)
    expect(player.currentTrack?.id).toBe('test-2')

    player.prevTrack()
    expect(player.queueIndex).toBe(0)
    expect(player.currentTrack?.id).toBe('test-1')
  })

  it('cycles repeat mode off -> all -> one -> off', () => {
    const player = usePlayerStore()
    expect(player.repeatMode).toBe('off')

    player.cycleRepeatMode()
    expect(player.repeatMode).toBe('all')

    player.cycleRepeatMode()
    expect(player.repeatMode).toBe('one')

    player.cycleRepeatMode()
    expect(player.repeatMode).toBe('off')
  })

  it('handles volume and mute', () => {
    const player = usePlayerStore()
    player.setVolume(0.5)
    expect(player.volume).toBe(0.5)

    player.toggleMute()
    expect(player.isMuted).toBe(true)

    player.toggleMute()
    expect(player.isMuted).toBe(false)
  })

  it('clears the queue', () => {
    const player = usePlayerStore()
    player.playTrack(sampleTrack1, [sampleTrack1])
    expect(player.queue.length).toBe(1)

    player.clearQueue()
    expect(player.queue.length).toBe(0)
    expect(player.currentTrack).toBeNull()
    expect(player.isPlaying).toBe(false)
  })
})
