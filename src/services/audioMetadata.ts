import * as mm from 'music-metadata-browser'

export interface ParsedAudioMetadata {
  title: string
  artist: string
  album: string
  genre: string
  year?: number
  trackNumber?: number
  durationMs: number
  bitrate?: number
  sampleRate?: number
  coverBlob?: Blob
  coverUrl?: string
  contentHash?: string
  fileSizeBytes: number
  mimeType: string
  fileExtension: string
}

const SUPPORTED_EXTENSIONS = ['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'opus']

export function isAudioFormatSupported(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (SUPPORTED_EXTENSIONS.includes(ext)) {
    return true
  }
  return file.type.startsWith('audio/')
}

export async function parseAudioFile(file: File): Promise<ParsedAudioMetadata> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3'
  const baseName = file.name.replace(/\.[^/.]+$/, '').trim()

  // Default fallback metadata from filename
  let parsedArtist = 'فنان غير معروف'
  let parsedTitle = baseName
  let parsedAlbum = 'مفردات (Singles)'
  let parsedGenre = 'عام'
  let parsedYear: number | undefined
  let parsedTrackNo = 1
  let durationMs = 0
  let bitrate: number | undefined
  let sampleRate: number | undefined
  let coverBlob: Blob | undefined
  let coverUrl: string | undefined

  // Attempt smart split if filename is "Artist - Title"
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ')
    if (parts.length >= 2) {
      parsedArtist = parts[0].trim()
      parsedTitle = parts.slice(1).join(' - ').trim()
    }
  }

  try {
    const metadata = await mm.parseBlob(file, { duration: true })

    if (metadata.common) {
      if (metadata.common.title) parsedTitle = metadata.common.title.trim()
      if (metadata.common.artist) parsedArtist = metadata.common.artist.trim()
      if (metadata.common.album) parsedAlbum = metadata.common.album.trim()
      if (metadata.common.genre && metadata.common.genre.length > 0) {
        parsedGenre = metadata.common.genre[0].trim()
      }
      if (metadata.common.year) parsedYear = metadata.common.year
      if (metadata.common.track?.no) parsedTrackNo = metadata.common.track.no

      // Extract embedded picture
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0]
        coverBlob = new Blob([new Uint8Array(pic.data)], { type: pic.format })
        coverUrl = URL.createObjectURL(coverBlob)
      }
    }

    if (metadata.format) {
      if (metadata.format.duration) {
        durationMs = Math.round(metadata.format.duration * 1000)
      }
      if (metadata.format.bitrate) {
        bitrate = Math.round(metadata.format.bitrate / 1000) // kbps
      }
      if (metadata.format.sampleRate) {
        sampleRate = metadata.format.sampleRate
      }
    }
  } catch (err) {
    console.warn(`[audioMetadata] Could not extract ID3 tags for ${file.name}, using filename fallback:`, err)
  }

  return {
    title: parsedTitle || baseName,
    artist: parsedArtist,
    album: parsedAlbum,
    genre: parsedGenre,
    year: parsedYear,
    trackNumber: parsedTrackNo,
    durationMs,
    bitrate,
    sampleRate,
    coverBlob,
    coverUrl,
    fileSizeBytes: file.size,
    mimeType: file.type || `audio/${ext}`,
    fileExtension: ext
  }
}
