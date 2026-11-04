<script setup lang="ts">
import { onMounted } from 'vue'
import {
  DownloadCloud,
  Trash2,
  HardDrive,
  ShieldAlert,
  CheckCircle2,
  Play,
  ShieldCheck,
  Music2,
  Clock
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { useOfflineStore } from '@/stores/offline'
import AppLoadingState from '@/components/common/AppLoadingState.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t } = useI18n()
const player = usePlayerStore()
const offline = useOfflineStore()

onMounted(async () => {
  await offline.loadDownloadedTracks()
})

const handleClearAll = async () => {
  if (confirm(t('views.downloads.clearAll') + '؟ لن يؤثر ذلك على ملفاتك السحابية.')) {
    await offline.clearAllDownloads()
  }
}

const handleRemoveTrack = async (trackId: string) => {
  if (confirm('هل ترغب بإزالة هذا الملف من الذاكرة المحلية لهذا الجهاز؟')) {
    await offline.removeDownload(trackId)
  }
}

const handleRequestPersistence = async () => {
  const granted = await offline.requestPersistence()
  if (granted) {
    alert('تم منح إذن الحفاظ على مساحة التخزين من المتصفح بنجاح!')
  } else {
    alert('لم يتمكن المتصفح من تثبيت التخزين الدائم (يعتمد على سياسة المتصفح ومساحة القرص).')
  }
}

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const formatSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-6 pb-12 select-none">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
          <DownloadCloud class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span>{{ t('views.downloads.title') }}</span>
            <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-mono font-medium">
              {{ offline.downloadedTracks.length }}
            </span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">{{ t('views.downloads.subtitle') }}</p>
        </div>
      </div>

      <button
        v-if="offline.downloadedTracks.length > 0"
        @click="handleClearAll"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 text-xs font-semibold transition active:scale-95"
      >
        <Trash2 class="w-4 h-4 text-red-400" />
        <span>{{ t('views.downloads.clearAll') }}</span>
      </button>
    </div>

    <!-- Storage Info & Browser Eviction Warning -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Storage Card -->
      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-2 font-medium text-slate-300">
            <HardDrive class="w-4 h-4 text-orange-400" />
            <span>{{ t('views.downloads.storageUsed') }}</span>
          </span>
          <span class="font-mono text-white font-semibold">
            {{ offline.storageUsageMB }} MB / {{ offline.storageQuotaMB > 0 ? (offline.storageQuotaMB / 1024).toFixed(1) + ' GB' : 'غير محدد' }}
          </span>
        </div>

        <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            class="h-full bg-emerald-500 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(100, Math.max(5, offline.percentUsed))}%` }"
          ></div>
        </div>

        <!-- Persistent Storage Indicator -->
        <div class="flex items-center justify-between pt-1 text-[11px]">
          <span class="text-slate-400">حماية الذاكرة من الحذف:</span>
          <button
            v-if="!offline.isPersisted"
            @click="handleRequestPersistence"
            class="text-orange-400 hover:text-orange-300 font-semibold underline"
          >
            طلب التثبيت الدائم
          </button>
          <span v-else class="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>مفعل (Persisted)</span>
          </span>
        </div>
      </div>

      <!-- Eviction Note Card -->
      <div class="md:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3.5 text-xs text-slate-300">
        <ShieldAlert class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div class="space-y-1">
          <h4 class="font-semibold text-slate-200">{{ t('views.downloads.onlyOnThisDevice') }}</h4>
          <p class="text-slate-400 leading-relaxed">
            الملفات المنزلة تُخزن داخل IndexedDB كـ Blobs على هذا الجهاز فقط. لا تؤثر على مساحتك السحابية في Supabase، ولا تنتقل تلقائياً لأجهزتك الأخرى.
            يُرجى ملاحظة أن المتصفح قد يقوم بإخلاء التخزين المؤقت في حالات نادرة عند امتلاء ذاكرة الهاتف أو المتصفح، لذا لا يوجد ضمان مطلق للاحتفاظ بدون اتصال دون تفعيل الحماية.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <AppLoadingState v-if="offline.isLoading" />

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="offline.downloadedTracks.length === 0"
      title="لا توجد أغانٍ منزلة محلياً"
      description="يمكنك تنزيل أي أغنية من المكتبة للاستماع إليها دون اتصال بالإنترنت في أي مكان."
    >
      <template #icon>
        <DownloadCloud class="w-8 h-8 text-emerald-400" />
      </template>
    </AppEmptyState>

    <!-- Downloaded List -->
    <div v-else class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40 shadow-sm">
      <div
        v-for="track in offline.downloadedTracks"
        :key="track.id"
        class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
        @click="player.playTrack(track, offline.downloadedTracks)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
            <img v-if="track.cover_url" :src="track.cover_url" alt="" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
              <Music2 class="w-5 h-5" />
            </div>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-white truncate">{{ track.title }}</h4>
              <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 class="w-3 h-3" />
                <span>Offline Ready</span>
              </span>
            </div>
            <p class="text-xs text-slate-400 truncate mt-0.5">
              {{ track.artist_name || 'فنان غير معروف' }} • {{ formatSize(track.file_size_bytes || 0) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ formatDuration(track.duration_ms) }}</span>
          </span>

          <button
            class="p-2 text-orange-500 hover:text-orange-400 transition active:scale-95"
            title="تشغيل بدون إنترنت"
          >
            <Play class="w-5 h-5 fill-current" />
          </button>

          <button
            @click.stop="handleRemoveTrack(track.id)"
            class="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            title="إزالة من هذا الجهاز"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
