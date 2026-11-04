import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { syncService, type SyncState } from '@/services/syncService'
import { deviceService, getOrCreateDeviceId } from '@/services/deviceService'
import { useAuthStore } from './auth'
import { useNetworkStore } from './network'
import type { Device, PlaybackStateSync } from '@/types'

export const useSyncStore = defineStore('sync', () => {
  const auth = useAuthStore()
  const network = useNetworkStore()

  const deviceId = ref(getOrCreateDeviceId())
  const currentDevice = ref<Device | null>(null)
  const registeredDevices = ref<Device[]>([])
  const syncStatus = ref<SyncState>('synced')
  const pendingOutboxCount = ref(0)
  const lastSyncTime = ref<string | null>(null)

  const ownerId = computed(() => auth.user?.id || 'demo-owner-uuid')

  const init = async () => {
    // 1. Register this device
    currentDevice.value = await deviceService.registerOrUpdateDevice(ownerId.value)
    // 2. Fetch list of registered devices
    await loadDevices()
    // 3. Check outbox
    await updatePendingCount()

    // 4. Auto sync outbox if online
    if (network.isOnline) {
      await flushOutbox()
    }
  }

  const loadDevices = async () => {
    registeredDevices.value = await deviceService.fetchDevices(ownerId.value)
  }

  const updatePendingCount = async () => {
    pendingOutboxCount.value = await syncService.getPendingOutboxCount()
    if (!network.isOnline) {
      syncStatus.value = 'offline'
    } else if (pendingOutboxCount.value > 0) {
      syncStatus.value = 'pending'
    } else {
      syncStatus.value = 'synced'
    }
  }

  const syncPlaybackPosition = async (trackId: string, positionMs: number): Promise<boolean> => {
    if (!network.isOnline) return false
    return await syncService.pushPlaybackState(ownerId.value, trackId, positionMs)
  }

  const pullPlaybackPosition = async (): Promise<PlaybackStateSync | null> => {
    if (!network.isOnline) return null
    return await syncService.pullPlaybackState(ownerId.value)
  }

  const enqueueOfflineChange = async (action: any, payload: any) => {
    await syncService.enqueueAction(action, payload)
    await updatePendingCount()
  }

  const flushOutbox = async () => {
    if (!network.isOnline) {
      syncStatus.value = 'offline'
      return
    }

    syncStatus.value = 'syncing'
    try {
      const { syncedCount } = await syncService.flushOutbox(ownerId.value)
      if (syncedCount > 0) {
        lastSyncTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      await updatePendingCount()
    } catch {
      syncStatus.value = 'error'
    }
  }

  return {
    deviceId,
    currentDevice,
    registeredDevices,
    syncStatus,
    pendingOutboxCount,
    lastSyncTime,
    init,
    loadDevices,
    updatePendingCount,
    syncPlaybackPosition,
    pullPlaybackPosition,
    enqueueOfflineChange,
    flushOutbox
  }
})
