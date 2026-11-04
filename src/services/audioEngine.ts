import type { Track, RepeatMode } from '@/types'
import { storageService, isSupabaseConfigured } from './supabase'

const STORAGE_LAST_STATE_KEY = 'mysound_last_playback'

export interface SavedPlaybackState {
  track: Track
  positionSeconds: number
  updatedAt: string
}

export type AudioEngineEventCallback = (event: string, payload?: any) => void

export class AudioEngine {
  private static instance: AudioEngine
  public audio: HTMLAudioElement
  private listeners: AudioEngineEventCallback[] = []
  private signedUrlExpiry: number = 0
  private currentTrack: Track | null = null
  private repeatMode: RepeatMode = 'off'
  private isSyntheticFallback = false
  private audioCtx: AudioContext | null = null
  private synthOscillator: OscillatorNode | null = null
  private synthGain: GainNode | null = null

  private constructor() {
    this.audio = new Audio()
    this.audio.preload = 'metadata'
    this.setupAudioListeners()
    this.setupPageLifecycleListeners()
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  public on(callback: AudioEngineEventCallback): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  private emit(event: string, payload?: any) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload)
      } catch (err) {
        console.error('[AudioEngine] Listener error:', err)
      }
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('play', () => {
      this.updateMediaSessionPlaybackState('playing')
      this.emit('play')
    })

    this.audio.addEventListener('pause', () => {
      this.updateMediaSessionPlaybackState('paused')
      this.savePosition()
      this.emit('pause')
    })

    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime)
      // Save position periodically every 5 seconds
      if (Math.floor(this.audio.currentTime) % 5 === 0) {
        this.savePosition()
      }
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.emit('loadedmetadata', this.audio.duration)
    })

    this.audio.addEventListener('waiting', () => {
      this.emit('waiting')
    })

    this.audio.addEventListener('canplay', () => {
      this.emit('canplay')
    })

    this.audio.addEventListener('ended', () => {
      this.emit('ended')
    })

    this.audio.addEventListener('error', async (e) => {
      console.warn('[AudioEngine] Playback error encountered:', e)
      await this.handlePlaybackError()
    })
  }

  private setupPageLifecycleListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.savePosition()
      })

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.savePosition()
        }
      })
    }
  }

  public setRepeatMode(mode: RepeatMode) {
    this.repeatMode = mode
  }

  public getRepeatMode(): RepeatMode {
    return this.repeatMode
  }

  public isSignedUrlExpired(): boolean {
    return this.signedUrlExpiry > 0 && Date.now() >= this.signedUrlExpiry
  }

  /**
   * Plays a track, fetching a fresh signed URL from Supabase Storage if needed,
   * or playing directly from IndexedDB if downloaded locally.
   */
  public async loadAndPlay(track: Track, startTime = 0): Promise<boolean> {
    this.currentTrack = track
    this.stopSynthetic()

    try {
      this.emit('waiting')
      let streamUrl = ''

      // 1. Check if track is downloaded locally in IndexedDB
      const { downloadService } = await import('./downloadService')
      const offlineBlob = await downloadService.getOfflineAudioBlob(track.id)

      if (offlineBlob) {
        console.log('[AudioEngine] Playing track from local IndexedDB offline storage!')
        streamUrl = URL.createObjectURL(offlineBlob)
      } else {
        // 2. If NOT downloaded locally, check online connection
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
        if (!isOnline) {
          const msg = 'هذه الأغنية غير منزلة محلياً على هذا الجهاز وتتطلب اتصالاً بالإنترنت لتشغيلها.'
          this.emit('error', msg)
          return false
        }

        // 3. Online cloud stream via Supabase signed URL
        if (isSupabaseConfigured() && track.storage_path) {
          const { url, error } = await storageService.getSignedAudioUrl(track.storage_path, 3600)
          if (error || !url) {
            throw error || new Error('Could not get signed URL')
          }
          streamUrl = url
          this.signedUrlExpiry = Date.now() + 3500 * 1000
        } else if (track.storage_path && track.storage_path.startsWith('http')) {
          streamUrl = track.storage_path
        } else {
          return this.startSyntheticPlayback(track, startTime)
        }
      }

      this.audio.src = streamUrl
      if (startTime > 0) {
        this.audio.currentTime = startTime
      }

      await this.audio.play()
      this.updateMediaSessionMetadata(track)
      this.savePosition()
      return true
    } catch (err: any) {
      console.warn('[AudioEngine] Direct play error, checking fallback:', err)
      if (err.name === 'NotAllowedError') {
        this.emit('autoplay_blocked')
        return false
      }
      return this.startSyntheticPlayback(track, startTime)
    }
  }

  /**
   * Handles stream errors or expired signed URLs by renewing the URL and resuming position.
   */
  private async handlePlaybackError() {
    if (!this.currentTrack) return

    const currentPos = this.audio.currentTime

    // Attempt to renew signed URL if using Supabase
    if (isSupabaseConfigured() && this.currentTrack.storage_path) {
      console.log('[AudioEngine] Attempting to renew expired signed URL...')
      const { url } = await storageService.getSignedAudioUrl(this.currentTrack.storage_path, 3600)
      if (url) {
        this.audio.src = url
        this.audio.currentTime = currentPos
        try {
          await this.audio.play()
          console.log('[AudioEngine] Successfully resumed playback after renewing URL!')
          return
        } catch (err) {
          console.error('[AudioEngine] Resume failed after renewing:', err)
        }
      }
    }

    // If stream fails completely, inform listeners
    this.emit('error', 'تعذر تشغيل الملف الصوتي. يرجى التحقق من اتصالك بالإنترنت.')
  }

  public async play(): Promise<void> {
    if (this.isSyntheticFallback) {
      this.resumeSynthetic()
      return
    }
    try {
      await this.audio.play()
    } catch (err) {
      console.warn('[AudioEngine] Play request blocked or failed:', err)
    }
  }

  public pause(): void {
    if (this.isSyntheticFallback) {
      this.pauseSynthetic()
      return
    }
    this.audio.pause()
    this.savePosition()
  }

  public seek(seconds: number): void {
    const validSec = Math.max(0, Math.min(seconds, this.audio.duration || 9999))
    if (this.isSyntheticFallback) {
      this.emit('timeupdate', validSec)
      return
    }
    this.audio.currentTime = validSec
    this.savePosition()
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume))
    this.audio.volume = clamped
    if (this.synthGain) {
      this.synthGain.gain.setValueAtTime(clamped * 0.15, this.audioCtx?.currentTime || 0)
    }
  }

  public setMuted(muted: boolean): void {
    this.audio.muted = muted
    if (this.synthGain) {
      this.synthGain.gain.setValueAtTime(muted ? 0 : this.audio.volume * 0.15, this.audioCtx?.currentTime || 0)
    }
  }

  /**
   * Saves playback position to localStorage
   */
  public savePosition(): void {
    if (!this.currentTrack || typeof window === 'undefined') return
    const state: SavedPlaybackState = {
      track: this.currentTrack,
      positionSeconds: Math.floor(this.audio.currentTime),
      updatedAt: new Date().toISOString()
    }
    try {
      localStorage.setItem(STORAGE_LAST_STATE_KEY, JSON.stringify(state))
    } catch {}
  }

  /**
   * Restores last saved playback state
   */
  public getSavedPosition(): SavedPlaybackState | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(STORAGE_LAST_STATE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SavedPlaybackState
    } catch {
      return null
    }
  }

  /**
   * Media Session API integration for lockscreen, notifications, and headset controls.
   */
  private updateMediaSessionMetadata(track: Track): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    try {
      const artwork = track.cover_url
        ? [
            { src: track.cover_url, sizes: '96x96', type: 'image/jpeg' },
            { src: track.cover_url, sizes: '256x256', type: 'image/jpeg' },
            { src: track.cover_url, sizes: '512x512', type: 'image/jpeg' }
          ]
        : [{ src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }]

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist_name || 'MySound',
        album: track.album_title || 'Private Library',
        artwork
      })
    } catch (e) {
      console.warn('[AudioEngine] MediaSession metadata error:', e)
    }
  }

  public setMediaSessionActionHandlers(handlers: {
    onPlay: () => void
    onPause: () => void
    onNext: () => void
    onPrev: () => void
    onSeek: (pos: number) => void
  }): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    try {
      navigator.mediaSession.setActionHandler('play', () => handlers.onPlay())
      navigator.mediaSession.setActionHandler('pause', () => handlers.onPause())
      navigator.mediaSession.setActionHandler('previoustrack', () => handlers.onPrev())
      navigator.mediaSession.setActionHandler('nexttrack', () => handlers.onNext())
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek(details.seekTime)
        }
      })
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        handlers.onSeek(Math.max(0, this.audio.currentTime - 10))
      })
      navigator.mediaSession.setActionHandler('seekforward', () => {
        handlers.onSeek(Math.min(this.audio.duration || 0, this.audio.currentTime + 10))
      })
    } catch (e) {
      console.warn('[AudioEngine] MediaSession actions error:', e)
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state
    }
  }

  /**
   * Web Audio API Synthesizer fallback for demo / test tracks when no audio file is uploaded yet.
   * Produces a soft soothing ambient chord so users can test real sound output.
   */
  private startSyntheticPlayback(track: Track, _startTime = 0): boolean {
    this.isSyntheticFallback = true
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return false

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass()
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }

      this.stopSynthetic()

      this.synthOscillator = this.audioCtx.createOscillator()
      this.synthGain = this.audioCtx.createGain()

      // 432 Hz warm tuning
      this.synthOscillator.type = 'sine'
      this.synthOscillator.frequency.setValueAtTime(432, this.audioCtx.currentTime)

      this.synthGain.gain.setValueAtTime(this.audio.muted ? 0 : this.audio.volume * 0.1, this.audioCtx.currentTime)

      this.synthOscillator.connect(this.synthGain)
      this.synthGain.connect(this.audioCtx.destination)

      this.synthOscillator.start()

      this.updateMediaSessionMetadata(track)
      this.updateMediaSessionPlaybackState('playing')
      this.emit('play')
      this.emit('loadedmetadata', Math.floor(track.duration_ms / 1000))
      return true
    } catch (e) {
      console.warn('[AudioEngine] Web Audio fallback warning:', e)
      return false
    }
  }

  private pauseSynthetic() {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend()
    }
    this.updateMediaSessionPlaybackState('paused')
    this.emit('pause')
  }

  private resumeSynthetic() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
    this.updateMediaSessionPlaybackState('playing')
    this.emit('play')
  }

  private stopSynthetic() {
    if (this.synthOscillator) {
      try {
        this.synthOscillator.stop()
        this.synthOscillator.disconnect()
      } catch {}
      this.synthOscillator = null
    }
    this.isSyntheticFallback = false
  }
}

export const audioEngine = AudioEngine.getInstance()
