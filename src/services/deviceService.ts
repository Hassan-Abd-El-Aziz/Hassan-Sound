import { supabase, isSupabaseConfigured } from './supabase'
import type { Device } from '@/types'

const STORAGE_DEVICE_ID_KEY = 'mysound_device_id'

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device'
  let deviceId = localStorage.getItem(STORAGE_DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = 'dev-' + crypto.randomUUID()
    localStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

export function detectDeviceInfo(): {
  device_name: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
} {
  if (typeof navigator === 'undefined') {
    return {
      device_name: 'Desktop PC',
      device_type: 'desktop',
      browser: 'Browser',
      os: 'Unknown'
    }
  }

  const ua = navigator.userAgent
  let os = 'Unknown OS'
  if (ua.includes('Win')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  let browser = 'Browser'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari'
  else if (ua.includes('Firefox/')) browser = 'Firefox'

  let device_type: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (/iPad|Tablet/i.test(ua)) device_type = 'tablet'
  else if (/Mobi|Android/i.test(ua)) device_type = 'mobile'

  const device_name = `${os} (${browser})`

  return {
    device_name,
    device_type,
    browser,
    os
  }
}

export const deviceService = {
  async registerOrUpdateDevice(ownerId: string): Promise<Device> {
    const deviceId = getOrCreateDeviceId()
    const info = detectDeviceInfo()

    if (!isSupabaseConfigured()) {
      return {
        id: 'dev-rec-1',
        device_id: deviceId,
        device_name: info.device_name,
        device_type: info.device_type,
        browser: info.browser,
        os: info.os,
        last_active_at: new Date().toISOString()
      }
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .upsert(
          {
            owner_id: ownerId,
            device_id: deviceId,
            device_name: info.device_name,
            device_type: info.device_type,
            browser: info.browser,
            os: info.os,
            last_active_at: new Date().toISOString()
          },
          { onConflict: 'owner_id, device_id' }
        )
        .select('id, device_id, device_name, device_type, browser, os, last_active_at')
        .single()

      if (error) throw error

      return data as Device
    } catch (err) {
      console.warn('[DeviceService] Device registration warning:', err)
      return {
        id: 'dev-rec-local',
        device_id: deviceId,
        device_name: info.device_name,
        device_type: info.device_type,
        browser: info.browser,
        os: info.os,
        last_active_at: new Date().toISOString()
      }
    }
  },

  async fetchDevices(ownerId: string): Promise<Device[]> {
    if (!isSupabaseConfigured()) {
      const current = await this.registerOrUpdateDevice(ownerId)
      return [current]
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .select('id, device_id, device_name, device_type, browser, os, last_active_at')
        .eq('owner_id', ownerId)
        .order('last_active_at', { ascending: false })

      if (error) throw error
      return (data || []) as Device[]
    } catch (err) {
      console.warn('[DeviceService] fetchDevices error:', err)
      return []
    }
  }
}
