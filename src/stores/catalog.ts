import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Track } from '@/types'
import { catalogService, type FetchOptions } from '@/services/catalogService'

export const useCatalogStore = defineStore('catalog', () => {
  const tracks = ref<Track[]>([])
  const totalTracks = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalPages = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const selectedSort = ref<'title' | 'artist' | 'album' | 'duration' | 'created_at'>('title')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const fetchTracks = async (page = 1) => {
    isLoading.value = true
    error.value = null
    currentPage.value = page

    try {
      const opts: FetchOptions = {
        page,
        pageSize: pageSize.value,
        search: searchQuery.value,
        sortBy: selectedSort.value,
        sortOrder: sortOrder.value
      }

      const result = await catalogService.fetchTracks(opts)
      tracks.value = result.tracks
      totalTracks.value = result.totalCount
      totalPages.value = result.totalPages
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tracks'
    } finally {
      isLoading.value = false
    }
  }

  const addTrack = (track: Track) => {
    tracks.value.unshift(track)
    totalTracks.value++
  }

  const updateTrack = async (id: string, updates: Partial<Track>) => {
    const success = await catalogService.updateTrack(id, updates)
    if (success) {
      const idx = tracks.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        tracks.value[idx] = { ...tracks.value[idx], ...updates }
      }
    }
    return success
  }

  const deleteTrack = async (track: Track) => {
    const success = await catalogService.deleteTrack(track)
    if (success) {
      tracks.value = tracks.value.filter(t => t.id !== track.id)
      totalTracks.value = Math.max(0, totalTracks.value - 1)
    }
    return success
  }

  return {
    tracks,
    totalTracks,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    error,
    searchQuery,
    selectedSort,
    sortOrder,
    fetchTracks,
    addTrack,
    updateTrack,
    deleteTrack
  }
})
