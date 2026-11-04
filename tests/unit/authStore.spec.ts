import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store (Phase 2)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes owner profile state', async () => {
    const auth = useAuthStore()
    await auth.initialize()
    expect(auth.isInitialized).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isOwner).toBe(true)
  })

  it('can log out and log in', async () => {
    const auth = useAuthStore()
    await auth.initialize()
    expect(auth.isAuthenticated).toBe(true)

    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()

    const success = await auth.login('owner@mysound.com', 'password123')
    expect(success).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.email).toBe('owner@mysound.com')
  })
})
