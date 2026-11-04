import { describe, it, expect } from 'vitest'
import { isAudioFormatSupported, parseAudioFile } from '@/services/audioMetadata'

describe('Audio Metadata Service', () => {
  it('correctly validates supported audio extensions', () => {
    const mp3 = new File([''], 'track.mp3', { type: 'audio/mpeg' })
    const flac = new File([''], 'track.flac')
    const m4a = new File([''], 'track.m4a')
    const txt = new File([''], 'document.txt', { type: 'text/plain' })

    expect(isAudioFormatSupported(mp3)).toBe(true)
    expect(isAudioFormatSupported(flac)).toBe(true)
    expect(isAudioFormatSupported(m4a)).toBe(true)
    expect(isAudioFormatSupported(txt)).toBe(false)
  })

  it('falls back to smart filename parsing when ID3 tags are absent', async () => {
    const file = new File(['dummy audio stream'], 'Fairuz - Nassam Alayna El Hawa.mp3', { type: 'audio/mpeg' })
    const parsed = await parseAudioFile(file)

    expect(parsed.artist).toBe('Fairuz')
    expect(parsed.title).toBe('Nassam Alayna El Hawa')
    expect(parsed.fileExtension).toBe('mp3')
    expect(parsed.fileSizeBytes).toBe(18)
  })
})
