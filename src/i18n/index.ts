import { ref, computed } from 'vue'
import { messages } from './translations'
import type { Locale } from '@/types'

const STORAGE_KEY = 'mysound_locale'

const getInitialLocale = (): Locale => {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (saved === 'ar' || saved === 'en') {
    return saved
  }
  // Default to Arabic as requested
  return 'ar'
}

const currentLocale = ref<Locale>(getInitialLocale())

export function useI18n() {
  const locale = computed(() => currentLocale.value)
  const isRTL = computed(() => currentLocale.value === 'ar')

  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
    localStorage.setItem(STORAGE_KEY, newLocale)
    applyDirection(newLocale)
  }

  const toggleLocale = () => {
    setLocale(currentLocale.value === 'ar' ? 'en' : 'ar')
  }

  const applyDirection = (loc: Locale) => {
    if (typeof document !== 'undefined') {
      const isRtl = loc === 'ar'
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', loc)
    }
  }

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.')
    let current: any = messages[currentLocale.value]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        // Fallback to en or path
        let fallback: any = messages['en']
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey]
          } else {
            return path
          }
        }
        current = fallback
        break
      }
    }

    if (typeof current !== 'string') {
      return path
    }

    if (params) {
      return Object.entries(params).reduce((acc, [key, val]) => {
        return acc.replace(new RegExp(`{${key}}`, 'g'), String(val))
      }, current)
    }

    return current
  }

  // Initial apply
  applyDirection(currentLocale.value)

  return {
    locale,
    isRTL,
    setLocale,
    toggleLocale,
    t
  }
}
