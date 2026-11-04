import { describe, it, expect, beforeEach } from 'vitest'
import { useI18n } from '@/i18n'

describe('i18n Localization', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('translates nested keys correctly in default Arabic', () => {
    const { t, setLocale } = useI18n()
    setLocale('ar')
    expect(t('app.name')).toBe('MySound')
    expect(t('nav.home')).toBe('الرئيسية')
    expect(t('nav.library')).toBe('المكتبة / الأغاني')
  })

  it('switches to English and provides English translations', () => {
    const { t, setLocale, isRTL } = useI18n()
    setLocale('en')
    expect(isRTL.value).toBe(false)
    expect(t('nav.home')).toBe('Home')
    expect(t('nav.library')).toBe('Library / Tracks')
    expect(t('player.nowPlaying')).toBe('Now Playing')
  })

  it('interpolates parameters in messages', () => {
    const { t, setLocale } = useI18n()
    setLocale('ar')
    expect(t('common.tracksCount', { count: 5 })).toBe('5 أغنية')
  })

  it('falls back to key if translation not found', () => {
    const { t } = useI18n()
    expect(t('non.existent.key')).toBe('non.existent.key')
  })
})
