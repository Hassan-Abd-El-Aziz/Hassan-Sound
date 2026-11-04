import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Playlist, Track } from '@/types'
import { collectionsService, type HistoryEntry } from '@/services/collectionsService'
import { useAuthStore } from './auth'
import { useCatalogStore } from './catalog'

export const useCollectionsStore = defineStore('collections', () => {
  const auth = useAuthStore()
  const catalog = useCatalogStore()

  const playlists = ref<Playlist[]>([])
  const activePlaylistTracks = ref<Track[]>([])
  const favoriteIds = ref<Set<string>>(new Set(['demo-1', 'demo-3']))
  const history = ref<HistoryEntry[]>([])
  const isLoading = ref(false)

  const ownerId = computed(() => auth.user?.id || 'demo-owner-uuid')

  const favoriteTracks = computed(() => {
    return catalog.tracks.filter(t => favoriteIds.value.has(t.id))
  })

  const recentlyPlayedTracks = computed(() => {
    const seen = new Set<string>()
    const result: Track[] = []
    for (const h of history.value) {
      if (h.track && !seen.has(h.track.id)) {
        seen.add(h.track.id)
        result.push(h.track)
      }
    }
    return result
  })

  const loadPlaylists = async () => {
    isLoading.value = true
    try {
      playlists.value = await collectionsService.fetchPlaylists(ownerId.value)
    } finally {
      isLoading.value = false
    }
  }

  const createPlaylist = async (title: string, description?: string) => {
    const newPl = await collectionsService.createPlaylist(ownerId.value, title, description)
    playlists.value.unshift(newPl)
    return newPl
  }

  const deletePlaylist = async (id: string) => {
    const success = await collectionsService.deletePlaylist(id)
    if (success) {
      playlists.value = playlists.value.filter(p => p.id !== id)
    }
    return success
  }

  const loadPlaylistTracks = async (playlistId: string) => {
    isLoading.value = true
    try {
      activePlaylistTracks.value = await collectionsService.fetchPlaylistTracks(playlistId)
      return activePlaylistTracks.value
    } finally {
      isLoading.value = false
    }
  }

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const success = await collectionsService.addTrackToPlaylist(playlistId, track)
    if (success) {
      const pl = playlists.value.find(p => p.id === playlistId)
      if (pl) pl.track_count = (pl.track_count || 0) + 1
      activePlaylistTracks.value.push(track)
    }
    return success
  }

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const success = await collectionsService.removeTrackFromPlaylist(playlistId, trackId)
    if (success) {
      const pl = playlists.value.find(p => p.id === playlistId)
      if (pl && pl.track_count && pl.track_count > 0) pl.track_count--
      activePlaylistTracks.value = activePlaylistTracks.value.filter(t => t.id !== trackId)
    }
    return success
  }

  const loadFavorites = async () => {
    const ids = await collectionsService.fetchFavorites(ownerId.value)
    favoriteIds.value = new Set(ids)
  }

  const toggleFavorite = async (track: Track) => {
    const isFav = await collectionsService.toggleFavorite(ownerId.value, track.id)
    if (isFav) {
      favoriteIds.value.add(track.id)
      track.is_favorite = true
    } else {
      favoriteIds.value.delete(track.id)
      track.is_favorite = false
    }
    return isFav
  }

  const isFavorite = (trackId: string): boolean => {
    return favoriteIds.value.has(trackId)
  }

  const loadHistory = async () => {
    history.value = await collectionsService.fetchHistory(ownerId.value)
  }

  const recordPlayback = async (track: Track, durationMs: number, completed: boolean) => {
    await collectionsService.logPlayback(ownerId.value, track.id, durationMs, completed)
    await loadHistory()
  }

  return {
    playlists,
    activePlaylistTracks,
    favoriteIds,
    favoriteTracks,
    history,
    recentlyPlayedTracks,
    isLoading,
    loadPlaylists,
    createPlaylist,
    deletePlaylist,
    loadPlaylistTracks,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    loadFavorites,
    toggleFavorite,
    isFavorite,
    loadHistory,
    recordPlayback
  }
})
