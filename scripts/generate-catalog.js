import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mm from 'music-metadata-browser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Source folder for user's audio tracks (in project root)
const sourceDir = path.join(rootDir, 'الاغاني')
const publicDir = path.join(rootDir, 'public')
const tracksDestDir = path.join(publicDir, 'tracks')
const coversDestDir = path.join(publicDir, 'covers')
const manifestPath = path.join(publicDir, 'tracks.json')

const SUPPORTED_EXTS = ['.mp3', '.m4a', '.flac', '.wav', '.aac', '.ogg', '.opus']

async function buildCatalog() {
  console.log('[GenerateCatalog] Scanning tracks from:', sourceDir)

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  if (!fs.existsSync(tracksDestDir)) {
    fs.mkdirSync(tracksDestDir, { recursive: true })
  }
  if (!fs.existsSync(coversDestDir)) {
    fs.mkdirSync(coversDestDir, { recursive: true })
  }

  if (!fs.existsSync(sourceDir)) {
    console.warn(`[GenerateCatalog] Directory "${sourceDir}" not found. Creating empty folder.`)
    fs.mkdirSync(sourceDir, { recursive: true })
    fs.writeFileSync(manifestPath, JSON.stringify([], null, 2))
    return
  }

  const rawFiles = fs.readdirSync(sourceDir)
  const audioFiles = rawFiles.filter(f => SUPPORTED_EXTS.includes(path.extname(f).toLowerCase()))

  console.log(`[GenerateCatalog] Found ${audioFiles.length} audio files in "الاغاني"`)

  const catalog = []
  let index = 1

  // Natural numeric sort for filenames like 1.mp3, 2.mp3, 10.mp3
  audioFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  for (const file of audioFiles) {
    const srcFilePath = path.join(sourceDir, file)
    const destFilePath = path.join(tracksDestDir, file)

    // Copy file to public/tracks if missing or size differs
    try {
      const srcStat = fs.statSync(srcFilePath)
      let needsCopy = true
      if (fs.existsSync(destFilePath)) {
        const destStat = fs.statSync(destFilePath)
        if (destStat.size === srcStat.size) {
          needsCopy = false
        }
      }
      if (needsCopy) {
        fs.copyFileSync(srcFilePath, destFilePath)
      }
    } catch (e) {
      console.warn(`[GenerateCatalog] Error copying ${file}:`, e)
    }

    // Parse metadata
    let title = path.basename(file, path.extname(file)).trim()
    let artist = 'Hassan Sound'
    let album = 'مكتبتي الخاصة'
    let durationMs = 180000
    let bitrate = undefined
    let sampleRate = undefined
    let coverRelPath = undefined

    try {
      const buf = fs.readFileSync(srcFilePath)
      const meta = await mm.parseBuffer(buf)

      if (meta.common) {
        if (meta.common.title && meta.common.title.trim()) {
          title = meta.common.title.trim()
        }
        if (meta.common.artist && meta.common.artist.trim()) {
          artist = meta.common.artist.trim()
        }
        if (meta.common.album && meta.common.album.trim()) {
          album = meta.common.album.trim()
        }

        // Extract embedded cover artwork if present
        if (meta.common.picture && meta.common.picture.length > 0) {
          const pic = meta.common.picture[0]
          const coverFilename = `cover-${index}.jpg`
          const coverFullPath = path.join(coversDestDir, coverFilename)
          fs.writeFileSync(coverFullPath, Buffer.from(pic.data))
          coverRelPath = `covers/${coverFilename}`
        }
      }

      if (meta.format) {
        if (meta.format.duration) {
          durationMs = Math.round(meta.format.duration * 1000)
        }
        if (meta.format.bitrate) {
          bitrate = Math.round(meta.format.bitrate / 1000)
        }
        if (meta.format.sampleRate) {
          sampleRate = meta.format.sampleRate
        }
      }
    } catch (err) {
      console.warn(`[GenerateCatalog] Metadata warning for ${file}:`, err.message)
    }

    const stat = fs.statSync(srcFilePath)
    const trackRecord = {
      id: `git-${index}`,
      title,
      artist_name: artist,
      album_title: album,
      duration_ms: durationMs,
      bitrate,
      sample_rate: sampleRate,
      file_size_bytes: stat.size,
      mime_type: 'audio/mpeg',
      file_extension: path.extname(file).replace('.', '').toLowerCase(),
      storage_path: `tracks/${file}`,
      cover_url: coverRelPath,
      download_status: 'not_downloaded'
    }

    catalog.push(trackRecord)
    index++
  }

  fs.writeFileSync(manifestPath, JSON.stringify(catalog, null, 2), 'utf-8')
  console.log(`[GenerateCatalog] Successfully built catalog with ${catalog.length} tracks -> ${manifestPath}`)
}

buildCatalog().catch(err => {
  console.error('[GenerateCatalog] Fatal error:', err)
  process.exit(1)
})
