<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Play, Heart, DownloadCloud, ArrowRight, ArrowLeft, Disc3, Mic2, Tag, Calendar, Database, Hash } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks } from '@/data/demoTracks'

const route = useRoute()
const router = useRouter()
const { t, isRTL } = useI18n()
const player = usePlayerStore()

const track = computed(() => {
  const id = route.params.id as string
  return demoTracks.find(t => t.id === id) || demoTracks[0]
})

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-4xl mx-auto">
    <!-- Back Button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
    >
      <component :is="isRTL ? ArrowRight : ArrowLeft" class="w-4 h-4" />
      <span>{{ t('common.back') }}</span>
    </button>

    <!-- Track Header Card -->
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl">
      <div class="w-44 h-44 rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-2xl">
        <img :src="track.cover_url" alt="" class="w-full h-full object-cover" />
      </div>

      <div class="flex-1 text-center sm:text-start space-y-3">
        <span class="inline-block text-[11px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
          مسار صوتي (Audio Track)
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {{ track.title }}
        </h1>
        <p class="text-base text-slate-300">{{ track.artist_name }}</p>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
          <button
            @click="player.playTrack(track)"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition active:scale-95"
          >
            <Play class="w-4 h-4 fill-current" />
            <span>{{ t('player.play') }}</span>
          </button>
          <button
            @click="player.toggleFavorite(track)"
            class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition active:scale-95"
          >
            <Heart :class="['w-5 h-5', track.is_favorite ? 'fill-red-500 text-red-500' : '']" />
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-xs font-medium transition active:scale-95"
          >
            <DownloadCloud class="w-4 h-4 text-emerald-400" />
            <span>{{ t('player.download') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Metadata Details Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Mic2 class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">الفنان الرئيسي</span>
          <span class="text-sm font-semibold text-slate-200">{{ track.artist_name }}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Disc3 class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">الألبوم</span>
          <span class="text-sm font-semibold text-slate-200">{{ track.album_title }}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Calendar class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">سنة الإصدار</span>
          <span class="text-sm font-semibold text-slate-200">{{ track.release_year || '2024' }}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Tag class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">المدة الزمنية</span>
          <span class="text-sm font-mono font-semibold text-slate-200">{{ formatDuration(track.duration_ms) }}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Database class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">مسار التخزين الخاص</span>
          <span class="text-xs font-mono text-slate-300 truncate">{{ track.storage_path }}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
        <Hash class="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <span class="block text-xs text-slate-400">بصمة المحتوى (SHA-256)</span>
          <span class="text-xs font-mono text-slate-300">e3b0c44298fc1c149afb...</span>
        </div>
      </div>
    </div>
  </div>
</template>
