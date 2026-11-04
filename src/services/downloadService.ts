import { offlineDb, type OfflineTrackRecord } from './offlineDb'
import { storageService, isSupabaseConfigured } from './supabase'
import { computeFileHash } from './cryptoHash'
import type { Track, DownloadStatus } from '@/types'

export interface DownloadProgressCallback {
  (progress: number, status: DownloadStatus, error?: string): void
}

export const downloadService = {
  /**
   * Downloads track audio and cover, verifies integrity, and saves to IndexedDB.
   */
  async downloadTrack(track: Track, onProgress?: DownloadProgressCallback): Promise<boolean> {
    onProgress?.(5, 'downloading')

    try {
      let audioBlob: Blob
      let coverBlob: Blob | undefined

      if (isSupabaseConfigured() && track.storage_path) {
        // 1. Get signed audio URL
        const { url: audioUrl, error: audioUrlErr } = await storageService.getSignedAudioUrl(track.storage_path, 600)
        if (audioUrlErr || !audioUrl) throw audioUrlErr || new Error('Failed to get download URL')

        onProgress?.(25, 'downloading')

        // 2. Fetch Audio Blob
        const audioRes = await fetch(audioUrl)
        if (!audioRes.ok) throw new Error(`Audio download failed: HTTP ${audioRes.status}`)
        audioBlob = await audioRes.blob()

        onProgress?.(65, 'downloading')

        // 3. Fetch Cover Blob if available
        if (track.cover_storage_path) {
          const { url: coverUrl } = await storageService.getSignedCoverUrl(track.cover_storage_path, 600)
          if (coverUrl) {
            try {
              const coverRes = await fetch(coverUrl)
              if (coverRes.ok) {
                coverBlob = await coverRes.blob()
              }
            } catch (cErr) {
              console.warn('[DownloadService] Cover fetch ignored:', cErr)
            }
          }
        }
      } else {
        // Demo / test mode fallback audio generation
        onProgress?.(30, 'downloading')
        await new Promise(r => setTimeout(r, 400))
        audioBlob = new Blob(['DEMO_AUDIO_BLOB_STREAM'], { type: 'audio/mpeg' })
        onProgress?.(70, 'downloading')
      }

      onProgress?.(85, 'downloading')

      // 4. File Size & Integrity Hash Verification
      if (audioBlob.size === 0) {
        throw new Error('Downloaded file is empty (0 bytes)')
      }

      // If content hash is provided, verify SHA-256 match
      if (track.content_hash && isSupabaseConfigured()) {
        const computed = await computeFileHash(audioBlob)
        if (computed !== track.content_hash) {
          throw new Error('Hash verification failed: File was corrupted during download')
        }
      }

      // 5. Store verified record in IndexedDB
      const record: OfflineTrackRecord = {
        id: track.id,
        title: track.title,
        artist_name: track.artist_name,
        album_title: track.album_title,
        duration_ms: track.duration_ms,
        file_size_bytes: audioBlob.size,
        content_hash: track.content_hash,
        mime_type: audioBlob.type || 'audio/mpeg',
        audio_blob: audioBlob,
        cover_blob: coverBlob,
        downloaded_at: new Date().toISOString()
      }

      await offlineDb.tracks.put(record)

      onProgress?.(100, 'downloaded')
      return true
    } catch (err: any) {
      console.error('[DownloadService] Download error for track:', track.id, err)
      onProgress?.(0, 'failed', err.message || 'فشل التنزيل')
      return false
    }
  },

  /**
   * Retrieves offline audio blob for local playback.
   */
  async getOfflineAudioBlob(trackId: string): Promise<Blob | null> {
    try {
      const record = await offlineDb.tracks.get(trackId)
      return record?.audio_blob || null
    } catch {
      return null
    }
  },

  /**
   * Retrieves all downloaded tracks from IndexedDB.
   */
  async getAllDownloadedTracks(): Promise<Track[]> {
    try {
      const records = await offlineDb.tracks.toArray()
      return records.map(r => ({
        id: r.id,
        title: r.title,
        artist_name: r.artist_name || 'فنان غير معروف',
        album_title: r.album_title || 'مفردات',
        duration_ms: r.duration_ms,
        file_size_bytes: r.file_size_bytes,
        storage_path: 'offline://' + r.id,
        content_hash: r.content_hash,
        download_status: 'downloaded',
        cover_url: r.cover_blob ? URL.createObjectURL(r.cover_blob) : undefined
      }))
    } catch (err) {
      console.error('[DownloadService] Error fetching offline tracks:', err)
      return []
    }
  },

  /**
   * Checks if a track is downloaded locally.
   */
  async isTrackDownloaded(trackId: string): Promise<boolean> {
    try {
      const record = await offlineDb.tracks.get(trackId)
      return !!record
    } catch {
      return false
    }
  },

  /**
   * Removes a local download from this device's IndexedDB.
   * Does NOT delete the cloud file in Supabase.
   */
  async removeDownloadedTrack(trackId: string): Promise<boolean> {
    try {
      await offlineDb.tracks.delete(trackId)
      return true
    } catch (err) {
      console.error('[DownloadService] Remove offline track error:', err)
      return false
    }
  },

  /**
   * Clears all local downloads from this device only.
   */
  async clearAllDownloads(): Promise<boolean> {
    try {
      await offlineDb.tracks.clear()
      await offlineDb.queue.clear()
      return true
    } catch (err) {
      console.error('[DownloadService] Clear all offline tracks error:', err)
      return false
    }
  }
}
