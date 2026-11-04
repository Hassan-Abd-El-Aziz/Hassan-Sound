import { describe, it, expect } from 'vitest'
import { computeFileHash } from '@/services/cryptoHash'

describe('Crypto Hash Service', () => {
  it('computes valid SHA-256 hash for a File', async () => {
    const content = 'MySound Audio Content Test 12345'
    const blob = new Blob([content], { type: 'audio/mpeg' })
    const file = new File([blob], 'test.mp3', { type: 'audio/mpeg' })

    const hash = await computeFileHash(file)
    expect(typeof hash).toBe('string')
    expect(hash.length).toBe(64) // 256 bits = 64 hex characters
  })

  it('generates identical hash for identical content', async () => {
    const file1 = new File(['Same Sound Data'], 'song1.mp3')
    const file2 = new File(['Same Sound Data'], 'song2.mp3')

    const hash1 = await computeFileHash(file1)
    const hash2 = await computeFileHash(file2)
    expect(hash1).toBe(hash2)
  })
})
