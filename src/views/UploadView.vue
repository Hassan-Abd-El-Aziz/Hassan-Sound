<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileAudio, CheckCircle2, Trash2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

interface QueuedUpload {
  id: string
  name: string
  size: number
  progress: number
  status: 'idle' | 'uploading' | 'completed' | 'error'
  title: string
  artist: string
  album: string
}

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadQueue = ref<QueuedUpload[]>([])

const handleFileSelect = (files: FileList | null) => {
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    // Clean base name
    const rawName = file.name.replace(/\.[^/.]+$/, '')

    uploadQueue.value.push({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'idle',
      title: rawName,
      artist: 'فنان غير معروف',
      album: 'مفردات (Singles)'
    })
  }

  // Auto simulate start in Phase 1 demo
  startUploads()
}

const startUploads = () => {
  uploadQueue.value.forEach(item => {
    if (item.status === 'idle') {
      item.status = 'uploading'
      const interval = setInterval(() => {
        item.progress += 20
        if (item.progress >= 100) {
          item.progress = 100
          item.status = 'completed'
          clearInterval(interval)
        }
      }, 350)
    }
  })
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
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.flac,.wav,.aac,.ogg,.opus"
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

      <div class="mt-6">
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20"
        >
          اختر الملفات من جهازك
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
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400 shrink-0">
                <FileAudio class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-white truncate">{{ item.name }}</h4>
                <span class="text-xs text-slate-400 font-mono">{{ formatSize(item.size) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span v-if="item.status === 'completed'" class="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 class="w-4 h-4" />
                <span>مكتمل</span>
              </span>
              <span v-else-if="item.status === 'uploading'" class="text-xs text-orange-400 font-mono">
                {{ item.progress }}%
              </span>
              <button
                @click="removeItem(item.id)"
                class="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
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
                item.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'
              ]"
              :style="{ width: `${item.progress}%` }"
            ></div>
          </div>

          <!-- Metadata Inline Editor (Phase 1 preview) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <input
              v-model="item.title"
              placeholder="العنوان"
              class="h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-400"
            />
            <input
              v-model="item.artist"
              placeholder="الفنان"
              class="h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-400"
            />
            <input
              v-model="item.album"
              placeholder="الألبوم"
              class="h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
