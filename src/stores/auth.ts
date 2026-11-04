import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  is_owner: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // In Phase 1 foundation, we can simulate an authenticated owner session for UI preview,
  // or track state that can be toggled in LoginView.
  const user = ref<UserProfile | null>({
    id: 'owner-uuid-001',
    email: 'owner@mysound.local',
    display_name: 'مالك المكتبة (Owner)',
    is_owner: true
  })

  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isOwner = computed(() => !!user.value?.is_owner)

  const login = async (email: string, _pass: string) => {
    isLoading.value = true
    authError.value = null
    try {
      // In Phase 2, this calls supabase.auth.signInWithPassword({ email, password })
      user.value = {
        id: 'owner-uuid-001',
        email,
        display_name: 'مالك المكتبة',
        is_owner: true
      }
      return true
    } catch (err: any) {
      authError.value = err.message || 'Failed to sign in'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    // In Phase 2, calls supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    isLoading,
    authError,
    isAuthenticated,
    isOwner,
    login,
    logout
  }
})
