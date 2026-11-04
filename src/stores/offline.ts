import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Track } from '@/types'
import { downloadService } from '@/services/downloadService'
import { checkStorageEstimate, requestPersistentStorage } from '@/services/offlineDb'

export const useOfflineStore = defineStore('offline', () => {
  const downloadedTracks = ref<Track[]>([])
  const downloadingTrackIds = ref<Set<string>>(new Set())
  const downloadProgress = ref<Record<string, number>>({})

  const storageUsageMB = ref(0)
  const storageQuotaMB = ref(0)
  const percentUsed = ref(0)
  const isPersisted = ref(false)
  const isLoading = ref(false)

  const loadDownloadedTracks = async () => {
    isLoading.value = true
    try {
      downloadedTracks.value = await downloadService.getAllDownloadedTracks()
      await checkStorage()
    } finally {
      isLoading.value = false
    }
  }

  const downloadTrack = async (track: Track): Promise<boolean> => {
    if (downloadingTrackIds.value.has(track.id)) return false

    downloadingTrackIds.value.add(track.id)
    downloadProgress.value[track.id] = 0
    track.download_status = 'downloading'

    try {
      const success = await downloadService.downloadTrack(track, (prog, status) => {
        downloadProgress.value[track.id] = prog
        track.download_status = status
      })

      if (success) {
        track.download_status = 'downloaded'
        await loadDownloadedTracks()
      } else {
        track.download_status = 'failed'
      }
      return success
    } finally {
      downloadingTrackIds.value.delete(track.id)
    }
  }

  const removeDownload = async (trackId: string): Promise<boolean> => {
    const success = await downloadService.removeDownloadedTrack(trackId)
    if (success) {
      downloadedTracks.value = downloadedTracks.value.filter(t => t.id !== trackId)
      await checkStorage()
    }
    return success
  }

  const clearAllDownloads = async (): Promise<boolean> => {
    const success = await downloadService.clearAllDownloads()
    if (success) {
      downloadedTracks.value = []
      await checkStorage()
    }
    return success
  }

  const checkStorage = async () => {
    const res = await checkStorageEstimate()
    storageUsageMB.value = res.usageMB
    storageQuotaMB.value = res.quotaMB
    percentUsed.value = res.percentUsed
    isPersisted.value = res.isPersisted
  }

  const requestPersistence = async (): Promise<boolean> => {
    const persisted = await requestPersistentStorage()
    isPersisted.value = persisted
    return persisted
  }

  const isTrackDownloaded = (trackId: string): boolean => {
    return downloadedTracks.value.some(t => t.id === trackId)
  }

  const getOfflineAudioBlob = async (trackId: string): Promise<Blob | null> => {
    return await downloadService.getOfflineAudioBlob(trackId)
  }

  return {
    downloadedTracks,
    downloadingTrackIds,
    downloadProgress,
    storageUsageMB,
    storageQuotaMB,
    percentUsed,
    isPersisted,
    isLoading,
    loadDownloadedTracks,
    downloadTrack,
    removeDownload,
    clearAllDownloads,
    checkStorage,
    requestPersistence,
    isTrackDownloaded,
    getOfflineAudioBlob
  }
})
