import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Track, RepeatMode } from '@/types'

export const usePlayerStore = defineStore('player', () => {
  const isPlaying = ref(false)
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

  const playTrack = (track: Track, newQueue?: Track[]) => {
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
    isPlaying.value = true
  }

  const togglePlay = () => {
    if (!currentTrack.value && queue.value.length > 0) {
      playTrack(queue.value[0])
      return
    }
    isPlaying.value = !isPlaying.value
  }

  const pause = () => {
    isPlaying.value = false
  }

  const play = () => {
    if (currentTrack.value) {
      isPlaying.value = true
    }
  }

  const nextTrack = () => {
    if (queue.value.length === 0) return

    if (shuffle.value) {
      const rand = Math.floor(Math.random() * queue.value.length)
      queueIndex.value = rand
      currentTrack.value = queue.value[rand]
      currentTime.value = 0
      duration.value = Math.floor(queue.value[rand].duration_ms / 1000)
      isPlaying.value = true
      return
    }

    if (queueIndex.value < queue.value.length - 1) {
      queueIndex.value++
      currentTrack.value = queue.value[queueIndex.value]
      currentTime.value = 0
      duration.value = Math.floor(queue.value[queueIndex.value].duration_ms / 1000)
      isPlaying.value = true
    } else if (repeatMode.value === 'all') {
      queueIndex.value = 0
      currentTrack.value = queue.value[0]
      currentTime.value = 0
      duration.value = Math.floor(queue.value[0].duration_ms / 1000)
      isPlaying.value = true
    } else {
      isPlaying.value = false
    }
  }

  const prevTrack = () => {
    if (queue.value.length === 0) return

    // If more than 3 seconds in, seek to beginning
    if (currentTime.value > 3) {
      currentTime.value = 0
      return
    }

    if (queueIndex.value > 0) {
      queueIndex.value--
      currentTrack.value = queue.value[queueIndex.value]
      currentTime.value = 0
      duration.value = Math.floor(queue.value[queueIndex.value].duration_ms / 1000)
      isPlaying.value = true
    } else {
      currentTime.value = 0
    }
  }

  const seekTo = (seconds: number) => {
    currentTime.value = Math.max(0, Math.min(seconds, duration.value))
  }

  const setVolume = (val: number) => {
    volume.value = Math.max(0, Math.min(1, val))
    if (val > 0 && isMuted.value) {
      isMuted.value = false
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
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

  const clearQueue = () => {
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

  const openNowPlaying = () => {
    isNowPlayingOpen.value = true
  }

  const closeNowPlaying = () => {
    isNowPlayingOpen.value = false
  }

  return {
    isPlaying,
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
    clearQueue,
    toggleFavorite,
    openNowPlaying,
    closeNowPlaying
  }
})
