import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Track, RepeatMode } from '@/types'
import { audioEngine } from '@/services/audioEngine'

export const usePlayerStore = defineStore('player', () => {
  const isPlaying = ref(false)
  const isBuffering = ref(false)
  const currentTrack = ref<Track | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.85)
  const isMuted = ref(false)
  const shuffle = ref(false)
  const repeatMode = ref<RepeatMode>('off')
  const queue = ref<Track[]>([])
  const queueIndex = ref(-1)
  const isNowPlayingOpen = ref(false)
  const playbackError = ref<string | null>(null)

  // Progress percentage (0 - 100)
  const progressPercent = computed(() => {
    if (!duration.value || duration.value <= 0) return 0
    return Math.min(100, (currentTime.value / duration.value) * 100)
  })

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  // Connect AudioEngine events to Pinia
  audioEngine.on((event, payload) => {
    if (event === 'play') {
      isPlaying.value = true
      isBuffering.value = false
      playbackError.value = null
    } else if (event === 'pause') {
      isPlaying.value = false
    } else if (event === 'timeupdate') {
      currentTime.value = Math.floor(payload)
    } else if (event === 'loadedmetadata') {
      duration.value = Math.floor(payload)
      isBuffering.value = false
    } else if (event === 'waiting') {
      isBuffering.value = true
    } else if (event === 'canplay') {
      isBuffering.value = false
    } else if (event === 'ended') {
      handleTrackEnded()
    } else if (event === 'error') {
      isBuffering.value = false
      playbackError.value = payload || 'تعذر تشغيل الملف'
    }
  })

  // Connect Media Session Actions
  audioEngine.setMediaSessionActionHandlers({
    onPlay: () => togglePlay(),
    onPause: () => pause(),
    onNext: () => nextTrack(),
    onPrev: () => prevTrack(),
    onSeek: (pos) => seekTo(pos)
  })

  const handleTrackEnded = () => {
    if (repeatMode.value === 'one') {
      audioEngine.seek(0)
      audioEngine.play()
    } else {
      nextTrack()
    }
  }

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    playbackError.value = null
    if (newQueue) {
      queue.value = [...newQueue]
      queueIndex.value = queue.value.findIndex(t => t.id === track.id)
    } else {
      const idx = queue.value.findIndex(t => t.id === track.id)
      if (idx === -1) {
        queue.value.push(track)
        queueIndex.value = queue.value.length - 1
      } else {
        queueIndex.value = idx
      }
    }

    currentTrack.value = track
    currentTime.value = 0
    duration.value = Math.floor(track.duration_ms / 1000)

    await audioEngine.loadAndPlay(track, 0)
  }

  const togglePlay = () => {
    if (!currentTrack.value && queue.value.length > 0) {
      playTrack(queue.value[0])
      return
    }

    if (isPlaying.value) {
      audioEngine.pause()
    } else {
      audioEngine.play()
    }
  }

  const pause = () => {
    audioEngine.pause()
  }

  const play = () => {
    if (currentTrack.value) {
      audioEngine.play()
    }
  }

  const nextTrack = () => {
    if (queue.value.length === 0) return

    if (shuffle.value) {
      const rand = Math.floor(Math.random() * queue.value.length)
      queueIndex.value = rand
      playTrack(queue.value[rand])
      return
    }

    if (queueIndex.value < queue.value.length - 1) {
      queueIndex.value++
      playTrack(queue.value[queueIndex.value])
    } else if (repeatMode.value === 'all') {
      queueIndex.value = 0
      playTrack(queue.value[0])
    } else {
      audioEngine.pause()
    }
  }

  const prevTrack = () => {
    if (queue.value.length === 0) return

    // If more than 3 seconds in, restart track
    if (currentTime.value > 3) {
      audioEngine.seek(0)
      return
    }

    if (queueIndex.value > 0) {
      queueIndex.value--
      playTrack(queue.value[queueIndex.value])
    } else {
      audioEngine.seek(0)
    }
  }

  const seekTo = (seconds: number) => {
    currentTime.value = Math.max(0, Math.min(seconds, duration.value))
    audioEngine.seek(seconds)
  }

  const setVolume = (val: number) => {
    volume.value = Math.max(0, Math.min(1, val))
    audioEngine.setVolume(volume.value)
    if (val > 0 && isMuted.value) {
      isMuted.value = false
      audioEngine.setMuted(false)
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    audioEngine.setMuted(isMuted.value)
  }

  const toggleShuffle = () => {
    shuffle.value = !shuffle.value
  }

  const cycleRepeatMode = () => {
    if (repeatMode.value === 'off') {
      repeatMode.value = 'all'
    } else if (repeatMode.value === 'all') {
      repeatMode.value = 'one'
    } else {
      repeatMode.value = 'off'
    }
    audioEngine.setRepeatMode(repeatMode.value)
  }

  const addToQueue = (track: Track) => {
    queue.value.push(track)
  }

  const removeFromQueue = (index: number) => {
    if (index >= 0 && index < queue.value.length) {
      queue.value.splice(index, 1)
      if (queueIndex.value >= index && queueIndex.value > 0) {
        queueIndex.value--
      }
    }
  }

  const moveQueueItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= queue.value.length || toIndex < 0 || toIndex >= queue.value.length) return
    const item = queue.value.splice(fromIndex, 1)[0]
    queue.value.splice(toIndex, 0, item)
    if (queueIndex.value === fromIndex) {
      queueIndex.value = toIndex
    }
  }

  const clearQueue = () => {
    audioEngine.pause()
    queue.value = []
    queueIndex.value = -1
    currentTrack.value = null
    isPlaying.value = false
    currentTime.value = 0
  }

  const toggleFavorite = (track?: Track) => {
    const target = track || currentTrack.value
    if (target) {
      target.is_favorite = !target.is_favorite
    }
  }

  const restoreSavedState = () => {
    const saved = audioEngine.getSavedPosition()
    if (saved?.track) {
      currentTrack.value = saved.track
      currentTime.value = saved.positionSeconds
      duration.value = Math.floor(saved.track.duration_ms / 1000)
      queue.value = [saved.track]
      queueIndex.value = 0
    }
  }

  const openNowPlaying = () => {
    isNowPlayingOpen.value = true
  }

  const closeNowPlaying = () => {
    isNowPlayingOpen.value = false
  }

  return {
    isPlaying,
    isBuffering,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    queue,
    queueIndex,
    isNowPlayingOpen,
    playbackError,
    progressPercent,
    formattedCurrentTime,
    formattedDuration,
    playTrack,
    togglePlay,
    play,
    pause,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    addToQueue,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    toggleFavorite,
    restoreSavedState,
    openNowPlaying,
    closeNowPlaying
  }
})
