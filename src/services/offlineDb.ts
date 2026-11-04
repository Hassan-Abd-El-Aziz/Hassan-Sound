import Dexie, { type EntityTable } from 'dexie'
import type { Track, DownloadStatus } from '@/types'

export interface OfflineTrackRecord {
  id: string
  title: string
  artist_name?: string
  album_title?: string
  duration_ms: number
  file_size_bytes: number
  content_hash?: string
  mime_type: string
  audio_blob: Blob
  cover_blob?: Blob
  downloaded_at: string
}

export interface OfflineQueueItem {
  id: string
  track_id: string
  track: Track
  status: DownloadStatus
  progress: number
  error_message?: string
  started_at: string
}

export class MySoundOfflineDB extends Dexie {
  tracks!: EntityTable<OfflineTrackRecord, 'id'>
  queue!: EntityTable<OfflineQueueItem, 'id'>

  constructor() {
    super('MySoundOfflineDB')
    this.version(1).stores({
      tracks: 'id, title, artist_name, album_title, content_hash, downloaded_at',
      queue: 'id, track_id, status, started_at'
    })
  }
}

export const offlineDb = new MySoundOfflineDB()

export interface StorageEstimateResult {
  usageBytes: number
  quotaBytes: number
  usageMB: number
  quotaMB: number
  percentUsed: number
  isPersisted: boolean
}

export async function checkStorageEstimate(): Promise<StorageEstimateResult> {
  let usageBytes = 0
  let quotaBytes = 0
  let isPersisted = false

  if (typeof navigator !== 'undefined' && 'storage' in navigator) {
    try {
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate()
        usageBytes = estimate.usage || 0
        quotaBytes = estimate.quota || 0
      }
      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted()
      }
    } catch (e) {
      console.warn('[OfflineDB] Storage estimate error:', e)
    }
  }

  const usageMB = parseFloat((usageBytes / (1024 * 1024)).toFixed(2))
  const quotaMB = parseFloat((quotaBytes / (1024 * 1024)).toFixed(2))
  const percentUsed = quotaBytes > 0 ? parseFloat(((usageBytes / quotaBytes) * 100).toFixed(1)) : 0

  return {
    usageBytes,
    quotaBytes,
    usageMB,
    quotaMB,
    percentUsed,
    isPersisted
  }
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.persist) {
    try {
      return await navigator.storage.persist()
    } catch {
      return false
    }
  }
  return false
}
