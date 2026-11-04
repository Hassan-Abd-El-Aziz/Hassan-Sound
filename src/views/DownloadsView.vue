<script setup lang="ts">
import { computed } from 'vue'
import { DownloadCloud, Trash2, HardDrive, ShieldAlert, CheckCircle2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks } from '@/data/demoTracks'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t } = useI18n()
const player = usePlayerStore()

const downloadedTracks = computed(() => {
  return demoTracks.filter(t => t.download_status === 'downloaded')
})

const handleClearDownloads = () => {
  if (confirm(t('views.downloads.clearAll') + '؟')) {
    downloadedTracks.value.forEach(tr => {
      tr.download_status = 'not_downloaded'
    })
  }
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
          <DownloadCloud class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.downloads.title') }}</h1>
          <p class="text-sm text-slate-400 mt-1">{{ t('views.downloads.subtitle') }}</p>
        </div>
      </div>

      <button
        v-if="downloadedTracks.length > 0"
        @click="handleClearDownloads"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 text-xs font-semibold transition active:scale-95"
      >
        <Trash2 class="w-4 h-4 text-red-400" />
        <span>{{ t('views.downloads.clearAll') }}</span>
      </button>
    </div>

    <!-- Storage Card & Device Note -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-2 font-medium text-slate-300">
            <HardDrive class="w-4 h-4 text-orange-400" />
            <span>{{ t('views.downloads.storageUsed') }}</span>
          </span>
          <span class="font-mono text-white font-semibold">24.6 MB</span>
        </div>
        <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full w-1/4"></div>
        </div>
        <p class="text-[11px] text-slate-400">IndexedDB Storage (Device Isolated)</p>
      </div>

      <div class="md:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div class="space-y-1">
          <h4 class="font-semibold text-slate-200">{{ t('views.downloads.onlyOnThisDevice') }}</h4>
          <p class="text-slate-400 leading-relaxed">
            الملفات المنزلة تُحفظ في ذاكرة هذا المتصفح لتشغيلها عند انقطاع الإنترنت. حذفها من هنا يحرر مساحة هذا الجهاز فقط ولا يحذف ملفاتك السحابية الأصلية.
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-if="downloadedTracks.length === 0"
      title="لا توجد أغانٍ منزلة محلياً"
      description="يمكنك تنزيل أي أغنية من المكتبة للاستماع إليها دون اتصال بالإنترنت."
    >
      <template #icon>
        <DownloadCloud class="w-8 h-8 text-emerald-400" />
      </template>
    </AppEmptyState>

    <!-- Downloaded List -->
    <div v-else class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40">
      <div
        v-for="track in downloadedTracks"
        :key="track.id"
        class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
        @click="player.playTrack(track, downloadedTracks)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0">
            <img :src="track.cover_url" alt="" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-white truncate">{{ track.title }}</h4>
              <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 class="w-3 h-3" />
                <span>Offline Ready</span>
              </span>
            </div>
            <p class="text-xs text-slate-400 truncate mt-0.5">{{ track.artist_name }}</p>
          </div>
        </div>

        <button
          @click.stop="track.download_status = 'not_downloaded'"
          class="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
          title="Remove local copy"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
