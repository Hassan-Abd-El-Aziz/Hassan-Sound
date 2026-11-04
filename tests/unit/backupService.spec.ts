import { describe, it, expect } from 'vitest'
import { backupService } from '@/services/backupService'

describe('Backup and Manifest Service', () => {
  it('generates a valid LibraryManifest structure', async () => {
    const ownerId = 'test-owner-uuid'
    const manifest = await backupService.generateManifest(ownerId)

    expect(manifest).toBeDefined()
    expect(manifest.manifest_version).toBe('1.0')
    expect(manifest.app_name).toBe('MySound')
    expect(manifest.owner_id).toBe(ownerId)
    expect(manifest.exported_at).toBeDefined()

    expect(manifest.summary).toBeDefined()
    expect(typeof manifest.summary.tracks_count).toBe('number')
    expect(typeof manifest.summary.artists_count).toBe('number')
    expect(typeof manifest.summary.albums_count).toBe('number')
    expect(typeof manifest.summary.playlists_count).toBe('number')

    expect(Array.isArray(manifest.tracks)).toBe(true)
    expect(Array.isArray(manifest.artists)).toBe(true)
    expect(Array.isArray(manifest.albums)).toBe(true)
    expect(Array.isArray(manifest.playlists)).toBe(true)
    expect(Array.isArray(manifest.favorites)).toBe(true)
  })

  it('rejects corrupt JSON on import', async () => {
    const result = await backupService.importManifest('test-owner', '{ corrupt json !!!')
    expect(result.success).toBe(false)
    expect(result.tracksImported).toBe(0)
    expect(result.message).toContain('غير صالح')
  })

  it('rejects manifest missing required structure', async () => {
    const malformed = JSON.stringify({ name: 'random file', foo: 'bar' })
    const result = await backupService.importManifest('test-owner', malformed)
    expect(result.success).toBe(false)
    expect(result.tracksImported).toBe(0)
    expect(result.message).toContain('غير متوافقة')
  })

  it('successfully imports valid manifest JSON', async () => {
    const validManifest = {
      manifest_version: '1.0',
      app_name: 'MySound',
      exported_at: new Date().toISOString(),
      owner_id: 'test-owner',
      tracks: [
        {
          id: 'imported-track-1',
          title: 'Imported Test Track 1',
          artist_name: 'Import Artist',
          album_title: 'Import Album',
          duration_ms: 180000,
          storage_path: 'tracks/imported-1.mp3'
        },
        {
          id: 'imported-track-2',
          title: 'Imported Test Track 2',
          artist_name: 'Import Artist',
          album_title: 'Import Album',
          duration_ms: 210000,
          storage_path: 'tracks/imported-2.mp3'
        }
      ],
      playlists: [
        {
          id: 'pl-imported',
          title: 'Imported Playlist',
          description: 'A test imported playlist'
        }
      ]
    }

    const result = await backupService.importManifest('test-owner', JSON.stringify(validManifest))
    expect(result.success).toBe(true)
    expect(result.tracksImported).toBe(2)
  })
})
