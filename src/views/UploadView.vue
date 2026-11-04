<script setup lang="ts">
import { ref } from 'vue'
import {
  Upload,
  FolderUp,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Copy
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { parseAudioFile, isAudioFormatSupported, type ParsedAudioMetadata } from '@/services/audioMetadata'
import { computeFileHash } from '@/services/cryptoHash'
import { storageService, isSupabaseConfigured } from '@/services/supabase'
import { catalogService } from '@/services/catalogService'
import { useAuthStore } from '@/stores/auth'
import { useCatalogStore } from '@/stores/catalog'

interface UploadQueueItem {
  id: string
  file: File
  metadata: ParsedAudioMetadata
  contentHash: string
  progress: number
  status: 'pending' | 'parsing' | 'uploading' | 'completed' | 'error' | 'duplicate'
  errorMessage?: string
  isEditing?: boolean
}

const { t } = useI18n()
const auth = useAuthStore()
const catalog = useCatalogStore()

const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadQueue = ref<UploadQueueItem[]>([])
const isProcessingQueue = ref(false)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const triggerFolderSelect = () => {
  folderInput.value?.click()
}

const handleFileSelect = async (files: FileList | null) => {
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (!isAudioFormatSupported(file)) {
      continue
    }

    const itemId = Math.random().toString(36).substring(2, 9)

    // Add in parsing state
    const item: UploadQueueItem = {
      id: itemId,
      file,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'فنان غير معروف',
        album: 'مفردات',
        genre: 'عام',
        durationMs: 0,
        fileSizeBytes: file.size,
        mimeType: file.type || 'audio/mpeg',
        fileExtension: file.name.split('.').pop() || 'mp3'
      },
      contentHash: '',
      progress: 0,
      status: 'parsing'
    }

    uploadQueue.value.push(item)

    // Extract metadata & calculate hash asynchronously
    try {
      const [parsedMeta, hash] = await Promise.all([
        parseAudioFile(file),
        computeFileHash(file)
      ])

      item.metadata = parsedMeta
      item.contentHash = hash

      // Check if duplicate hash exists
      const existing = await catalogService.checkDuplicateHash(hash)
      if (existing) {
        item.status = 'duplicate'
        item.errorMessage = `هذا الملف مضاف مسبقاً بعنوان: "${existing.title}"`
      } else {
        item.status = 'pending'
      }
    } catch (err: any) {
      console.warn('Metadata parse warning:', err)
      item.status = 'pending'
    }
  }

  // Auto process pending items
  processNextInQueue()
}

const processNextInQueue = async () => {
  if (isProcessingQueue.value) return
  isProcessingQueue.value = true

  try {
    for (const item of uploadQueue.value) {
      if (item.status === 'pending') {
        await uploadSingleItem(item)
      }
    }
  } finally {
    isProcessingQueue.value = false
  }
}

const uploadSingleItem = async (item: UploadQueueItem) => {
  item.status = 'uploading'
  item.progress = 10

  const userId = auth.user?.id || 'demo-owner-uuid'
  const trackId = 'track-' + Math.random().toString(36).substring(2, 9)

  try {
    let audioStoragePath = `tracks/${item.contentHash || trackId}.${item.metadata.fileExtension}`
    let coverStoragePath: string | undefined

    if (isSupabaseConfigured()) {
      // 1. Upload Cover Artwork if available
      if (item.metadata.coverBlob) {
        const coverFile = new File([item.metadata.coverBlob], `${trackId}.jpg`, { type: 'image/jpeg' })
        const { path: cPath } = await storageService.uploadCover(coverFile, userId, trackId)
        if (cPath) coverStoragePath = cPath
      }
      item.progress = 40

      // 2. Upload Audio Track to private bucket
      const { path: aPath, error: uploadErr } = await storageService.uploadAudio(item.file, userId, trackId)
      if (uploadErr) throw uploadErr
      if (aPath) audioStoragePath = aPath
      item.progress = 80

      // 3. Insert record in Supabase PostgreSQL
      const createdTrack = await catalogService.createTrack(userId, {
        title: item.metadata.title,
        artist_name: item.metadata.artist,
        album_title: item.metadata.album,
        duration_ms: item.metadata.durationMs,
        mime_type: item.metadata.mimeType,
        file_extension: item.metadata.fileExtension,
        file_size_bytes: item.metadata.fileSizeBytes,
        bitrate: item.metadata.bitrate,
        sample_rate: item.metadata.sampleRate,
        storage_path: audioStoragePath,
        cover_storage_path: coverStoragePath,
        cover_url: item.metadata.coverUrl,
        content_hash: item.contentHash,
        track_number: item.metadata.trackNumber,
        release_year: item.metadata.year
      })

      catalog.addTrack(createdTrack)
    } else {
      // Demo mode upload simulation
      await new Promise(r => setTimeout(r, 600))
      item.progress = 70
      await new Promise(r => setTimeout(r, 500))

      const demoTrack = await catalogService.createTrack(userId, {
        title: item.metadata.title,
        artist_name: item.metadata.artist,
        album_title: item.metadata.album,
        duration_ms: item.metadata.durationMs || 180000,
        mime_type: item.metadata.mimeType,
        file_extension: item.metadata.fileExtension,
        file_size_bytes: item.metadata.fileSizeBytes,
        bitrate: item.metadata.bitrate || 320,
        sample_rate: item.metadata.sampleRate || 44100,
        storage_path: audioStoragePath,
        cover_url: item.metadata.coverUrl,
        content_hash: item.contentHash,
        track_number: item.metadata.trackNumber,
        release_year: item.metadata.year
      })

      catalog.addTrack(demoTrack)
    }

    item.progress = 100
    item.status = 'completed'
  } catch (err: any) {
    console.error('Upload failed:', err)
    item.status = 'error'
    item.errorMessage = err.message || 'فشل رفع الملف إلى التخزين السحابي'
  }
}

const retryItem = (item: UploadQueueItem) => {
  item.status = 'pending'
  item.errorMessage = undefined
  item.progress = 0
  processNextInQueue()
}

const removeItem = (id: string) => {
  uploadQueue.value = uploadQueue.value.filter(i => i.id !== id)
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="pb-4 border-b border-slate-800/60">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.upload.title') }}</h1>
      <p class="text-sm text-slate-400 mt-1">{{ t('views.upload.subtitle') }}</p>
    </div>

    <!-- Drag & Drop Zone -->
    <div
      :class="[
        'flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition cursor-pointer text-center group',
        isDragging
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="isDragging = false; handleFileSelect($event.dataTransfer?.files || null)"
      @click="triggerFileSelect"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.flac,.wav,.aac,.ogg,.opus"
        class="hidden"
        @change="handleFileSelect(($event.target as HTMLInputElement).files)"
      />
      <input
        ref="folderInput"
        type="file"
        multiple
        webkitdirectory
        class="hidden"
        @change="handleFileSelect(($event.target as HTMLInputElement).files)"
      />

      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600/20 to-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition duration-300">
        <Upload class="w-8 h-8" />
      </div>

      <h3 class="text-base sm:text-lg font-semibold text-slate-100 mb-1">
        {{ t('views.upload.dropzoneText') }}
      </h3>
      <p class="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
        {{ t('views.upload.supportedFormats') }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 mt-6" @click.stop>
        <button
          type="button"
          @click="triggerFileSelect"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Upload class="w-4 h-4" />
          <span>اختر ملفات</span>
        </button>
        <button
          type="button"
          @click="triggerFolderSelect"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-semibold text-xs transition active:scale-95"
        >
          <FolderUp class="w-4 h-4 text-orange-400" />
          <span>اختر مجلدًا كاملًا</span>
        </button>
      </div>
    </div>

    <!-- Upload Queue List -->
    <div v-if="uploadQueue.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ t('views.upload.queueTitle') }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {{ uploadQueue.length }}
          </span>
        </h3>
        <button
          @click="uploadQueue = []"
          class="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>تفريغ القائمة</span>
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in uploadQueue"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3"
        >
          <!-- Top Row: Artwork, Filename, Size, Status Actions -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60">
                <img v-if="item.metadata.coverUrl" :src="item.metadata.coverUrl" alt="" class="w-full h-full object-cover" />
                <FileAudio v-else class="w-6 h-6 text-orange-400" />
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-white truncate">{{ item.file.name }}</h4>
                <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span class="font-mono">{{ formatSize(item.file.size) }}</span>
                  <span v-if="item.metadata.bitrate">• {{ item.metadata.bitrate }} kbps</span>
                  <span v-if="item.contentHash" class="font-mono text-[10px] text-slate-400" :title="item.contentHash">
                    • Hash: {{ item.contentHash.substring(0, 8) }}...
                  </span>
                </div>
              </div>
            </div>

            <!-- Status Indicator & Action Buttons -->
            <div class="flex items-center gap-3">
              <span v-if="item.status === 'completed'" class="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 class="w-4 h-4" />
                <span>تم الرفع والحفظ</span>
              </span>
              <span v-else-if="item.status === 'uploading'" class="text-xs text-orange-400 font-mono">
                {{ item.progress }}%
              </span>
              <span v-else-if="item.status === 'duplicate'" class="flex items-center gap-1 text-xs text-amber-400 font-medium" :title="item.errorMessage">
                <Copy class="w-4 h-4" />
                <span>ملف مكرر</span>
              </span>
              <span v-else-if="item.status === 'error'" class="flex items-center gap-1 text-xs text-red-400 font-medium" :title="item.errorMessage">
                <AlertCircle class="w-4 h-4" />
                <span>خطأ</span>
              </span>

              <!-- Retry Button -->
              <button
                v-if="item.status === 'error'"
                @click="retryItem(item)"
                class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="إعادة المحاولة"
              >
                <RefreshCw class="w-4 h-4" />
              </button>

              <!-- Edit metadata toggle -->
              <button
                @click="item.isEditing = !item.isEditing"
                class="p-1.5 text-slate-400 hover:text-orange-400 rounded-lg hover:bg-slate-800 transition"
                title="تعديل البيانات الوصفية"
              >
                <Edit3 class="w-4 h-4" />
              </button>

              <!-- Remove button -->
              <button
                @click="removeItem(item.id)"
                class="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                title="حذف من القائمة"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              :class="[
                'h-full transition-all duration-300',
                item.status === 'completed' ? 'bg-emerald-500' : item.status === 'error' ? 'bg-red-500' : 'bg-orange-500'
              ]"
              :style="{ width: `${item.progress}%` }"
            ></div>
          </div>

          <!-- Error or Duplicate Warning Banner -->
          <div v-if="item.errorMessage" class="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ item.errorMessage }}</span>
          </div>

          <!-- Metadata Editor Fields -->
          <div v-if="item.isEditing || item.status === 'pending'" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <label class="block text-[10px] text-slate-400 mb-1">عنوان الأغنية (Title)</label>
              <input
                v-model="item.metadata.title"
                class="w-full h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] text-slate-400 mb-1">اسم الفنان (Artist)</label>
              <input
                v-model="item.metadata.artist"
                class="w-full h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] text-slate-400 mb-1">الألبوم (Album)</label>
              <input
                v-model="item.metadata.album"
                class="w-full h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
