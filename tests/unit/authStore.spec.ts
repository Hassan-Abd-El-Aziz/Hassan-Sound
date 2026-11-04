import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes owner profile state', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isOwner).toBe(true)
    expect(auth.user?.email).toBe('owner@mysound.local')
  })

  it('can log out and log in', async () => {
    const auth = useAuthStore()
    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()

    const success = await auth.login('myuser@mysound.com', 'password123')
    expect(success).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.email).toBe('myuser@mysound.com')
  })
})
