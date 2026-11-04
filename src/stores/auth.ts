import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/services/supabase'

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  is_owner: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isOwner = computed(() => !!user.value?.is_owner)
  const isConfigured = computed(() => isSupabaseConfigured())

  /**
   * Initializes session on application startup
   */
  const initialize = async () => {
    if (isInitialized.value) return

    if (!isSupabaseConfigured()) {
      // In unconfigured demo mode, load demo owner session
      user.value = {
        id: 'demo-owner-uuid',
        email: 'owner@mysound.local',
        display_name: 'مالك المكتبة (Demo Owner)',
        is_owner: true
      }
      isInitialized.value = true
      return
    }

    try {
      isLoading.value = true
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        await setSessionUser(session.user)
      } else {
        user.value = null
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          await setSessionUser(newSession.user)
        } else {
          user.value = null
        }
      })
    } catch (err: any) {
      console.error('[AuthStore] Initialization error:', err)
      authError.value = err.message || 'Failed to initialize session'
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const setSessionUser = async (authUser: any) => {
    try {
      // Fetch profile from 'profiles' table protected by RLS
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('[AuthStore] Profile fetch warning:', error)
      }

      user.value = {
        id: authUser.id,
        email: authUser.email || '',
        display_name: profile?.display_name || authUser.user_metadata?.display_name || 'مالك المكتبة',
        avatar_url: profile?.avatar_url,
        is_owner: profile?.is_owner ?? true
      }
    } catch {
      user.value = {
        id: authUser.id,
        email: authUser.email || '',
        display_name: authUser.user_metadata?.display_name || 'مالك المكتبة',
        is_owner: true
      }
    }
  }

  /**
   * Authenticates owner with email and password
   */
  const login = async (email: string, pass: string): Promise<boolean> => {
    isLoading.value = true
    authError.value = null

    if (!isSupabaseConfigured()) {
      // Demo mode login
      user.value = {
        id: 'demo-owner-uuid',
        email,
        display_name: 'مالك المكتبة (Demo)',
        is_owner: true
      }
      isLoading.value = false
      return true
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      })

      if (error) throw error
      if (data.user) {
        await setSessionUser(data.user)
        return true
      }
      return false
    } catch (err: any) {
      console.error('[AuthStore] Login failed:', err)
      authError.value = err.message || 'بيانات الدخول غير صحيحة أو الحساب غير مصرح له'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logs out current user session
   */
  const logout = async () => {
    isLoading.value = true
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut()
      }
      user.value = null
    } catch (err: any) {
      console.error('[AuthStore] Sign out error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isInitialized,
    isLoading,
    authError,
    isAuthenticated,
    isOwner,
    isConfigured,
    initialize,
    login,
    logout
  }
})
