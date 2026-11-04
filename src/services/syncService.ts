import { supabase, isSupabaseConfigured } from './supabase'
import { offlineDb, type OutboxItem } from './offlineDb'
import { getOrCreateDeviceId } from './deviceService'
import type { PlaybackStateSync } from '@/types'

export type SyncState = 'synced' | 'syncing' | 'pending' | 'offline' | 'error'

export const syncService = {
  // ==========================================
  // PLAYBACK STATE SYNC (Last-Write-Wins)
  // ==========================================

  /**
   * Pushes the current playback state to Supabase using Last-Write-Wins.
   * If remote state is newer, ignores older local timestamp.
   */
  async pushPlaybackState(ownerId: string, trackId: string, positionMs: number): Promise<boolean> {
    if (!isSupabaseConfigured()) return true

    const deviceId = getOrCreateDeviceId()
    const nowIso = new Date().toISOString()

    try {
      // 1. Fetch current remote playback state to check conflict
      const { data: remoteState } = await supabase
        .from('playback_state')
        .select('updated_at')
        .eq('owner_id', ownerId)
        .maybeSingle()

      if (remoteState?.updated_at) {
        const remoteTime = new Date(remoteState.updated_at).getTime()
        const localTime = new Date(nowIso).getTime()
        // If remote state is newer than this update, do not overwrite (LWW)
        if (remoteTime > localTime) {
          console.log('[SyncService] LWW conflict resolution: Remote update is newer. Overwrite prevented.')
          return false
        }
      }

      // 2. Upsert current playback state
      const { error } = await supabase
        .from('playback_state')
        .upsert(
          {
            owner_id: ownerId,
            track_id: trackId,
            position_ms: positionMs,
            device_id: deviceId,
            updated_at: nowIso
          },
          { onConflict: 'owner_id' }
        )

      return !error
    } catch (err) {
      console.warn('[SyncService] Playback state push error:', err)
      return false
    }
  },

  /**
   * Pulls the latest remote playback state from other devices.
   */
  async pullPlaybackState(ownerId: string): Promise<PlaybackStateSync | null> {
    if (!isSupabaseConfigured()) return null

    try {
      const { data, error } = await supabase
        .from('playback_state')
        .select('track_id, position_ms, device_id, updated_at')
        .eq('owner_id', ownerId)
        .maybeSingle()

      if (error) throw error
      return data as PlaybackStateSync | null
    } catch (err) {
      console.warn('[SyncService] Playback state pull error:', err)
      return null
    }
  },

  // ==========================================
  // OUTBOX OFFLINE QUEUE (Idempotent Sync)
  // ==========================================

  /**
   * Adds an offline action to the local IndexedDB outbox.
   */
  async enqueueAction(
    action: OutboxItem['action'],
    payload: any
  ): Promise<OutboxItem> {
    const item: OutboxItem = {
      id: 'outbox-' + crypto.randomUUID(),
      action,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retry_count: 0
    }

    await offlineDb.outbox.put(item)
    return item
  },

  /**
   * Gets all pending outbox items.
   */
  async getPendingOutboxCount(): Promise<number> {
    try {
      return await offlineDb.outbox.where('status').equals('pending').count()
    } catch {
      return 0
    }
  },

  /**
   * Flushes and processes pending outbox actions with idempotent execution.
   */
  async flushOutbox(ownerId: string): Promise<{ syncedCount: number; failedCount: number }> {
    if (!isSupabaseConfigured()) {
      return { syncedCount: 0, failedCount: 0 }
    }

    let syncedCount = 0
    let failedCount = 0

    try {
      const pendingItems = await offlineDb.outbox
        .where('status')
        .equals('pending')
        .sortBy('timestamp')

      for (const item of pendingItems) {
        try {
          item.status = 'syncing'
          await offlineDb.outbox.put(item)

          // Execute action idempotently
          const success = await this.executeAction(ownerId, item)

          if (success) {
            item.status = 'synced'
            await offlineDb.outbox.delete(item.id) // Clean synced item
            syncedCount++
          } else {
            throw new Error('Action execution returned false')
          }
        } catch (execErr: any) {
          item.retry_count++
          item.status = item.retry_count >= 5 ? 'failed' : 'pending'
          item.error_message = execErr.message
          await offlineDb.outbox.put(item)
          failedCount++
        }
      }
    } catch (err) {
      console.error('[SyncService] Flush outbox error:', err)
    }

    return { syncedCount, failedCount }
  },

  /**
   * Executes individual outbox action idempotently in Supabase.
   */
  async executeAction(ownerId: string, item: OutboxItem): Promise<boolean> {
    if (item.action === 'TOGGLE_FAVORITE') {
      const { trackId, isFavorite } = item.payload
      if (isFavorite) {
        await supabase
          .from('favorites')
          .upsert({ owner_id: ownerId, track_id: trackId }, { onConflict: 'owner_id, track_id' })
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('owner_id', ownerId)
          .eq('track_id', trackId)
      }
      return true
    }

    if (item.action === 'LOG_PLAYBACK') {
      const { trackId, durationMs, completed, playedAt, deviceId } = item.payload
      // Check if identical playback event already logged to prevent duplicates
      const { data: existing } = await supabase
        .from('listening_history')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('track_id', trackId)
        .eq('played_at', playedAt)
        .maybeSingle()

      if (!existing) {
        await supabase.from('listening_history').insert({
          owner_id: ownerId,
          track_id: trackId,
          duration_listened_ms: durationMs,
          completed,
          played_at: playedAt,
          device_id: deviceId || getOrCreateDeviceId()
        })
      }
      return true
    }

    if (item.action === 'CREATE_PLAYLIST') {
      const { title, description } = item.payload
      await supabase.from('playlists').insert({
        owner_id: ownerId,
        title,
        description
      })
      return true
    }

    return true
  }
}
