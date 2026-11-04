<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Play, Pause, Heart, MoreVertical, Search, CheckCircle2, Clock } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks } from '@/data/demoTracks'
import type { Track } from '@/types'

const { t } = useI18n()
const player = usePlayerStore()
const router = useRouter()

const searchQuery = ref('')
const selectedSort = ref<'title' | 'artist' | 'duration'>('title')

const filteredTracks = computed(() => {
  return demoTracks.filter(tr => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return true
    return (
      tr.title.toLowerCase().includes(q) ||
      (tr.artist_name && tr.artist_name.toLowerCase().includes(q)) ||
      (tr.album_title && tr.album_title.toLowerCase().includes(q))
    )
  }).sort((a, b) => {
    if (selectedSort.value === 'title') return a.title.localeCompare(b.title)
    if (selectedSort.value === 'artist') return (a.artist_name || '').localeCompare(b.artist_name || '')
    if (selectedSort.value === 'duration') return a.duration_ms - b.duration_ms
    return 0
  })
})

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const isTrackPlaying = (track: Track) => {
  return player.currentTrack?.id === track.id && player.isPlaying
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.library.title') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.library.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            class="w-full h-9 ps-9 pe-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-orange-500/60"
          />
        </div>

        <!-- Sort Select -->
        <select
          v-model="selectedSort"
          class="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500/60"
        >
          <option value="title">العنوان (Title)</option>
          <option value="artist">الفنان (Artist)</option>
          <option value="duration">المدة (Duration)</option>
        </select>
      </div>
    </div>

    <!-- Track List Table / Grid -->
    <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-sm">
      <div class="grid grid-cols-12 px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/60">
        <div class="col-span-1 text-center">#</div>
        <div class="col-span-6 sm:col-span-5">العنوان / المسار</div>
        <div class="hidden sm:block col-span-3">الألبوم</div>
        <div class="col-span-3 sm:col-span-2 text-end flex items-center justify-end gap-1">
          <Clock class="w-3.5 h-3.5" />
          <span>المدة</span>
        </div>
        <div class="col-span-2 sm:col-span-1 text-end">إجراءات</div>
      </div>

      <div class="divide-y divide-slate-800/40">
        <div
          v-for="(track, idx) in filteredTracks"
          :key="track.id"
          :class="[
            'grid grid-cols-12 items-center px-4 py-3 text-sm transition group cursor-pointer',
            player.currentTrack?.id === track.id ? 'bg-orange-500/10' : 'hover:bg-slate-800/50'
          ]"
          @click="player.playTrack(track, filteredTracks)"
        >
          <!-- Number / Play button -->
          <div class="col-span-1 text-center font-mono text-xs text-slate-400">
            <span class="group-hover:hidden">
              <span v-if="isTrackPlaying(track)" class="text-orange-500 font-bold">▶</span>
              <span v-else>{{ idx + 1 }}</span>
            </span>
            <button class="hidden group-hover:inline-flex text-orange-500 transition">
              <Pause v-if="isTrackPlaying(track)" class="w-4 h-4 fill-current" />
              <Play v-else class="w-4 h-4 fill-current" />
            </button>
          </div>

          <!-- Title & Artist & Cover -->
          <div class="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
              <img :src="track.cover_url" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <h4 :class="['text-sm font-semibold truncate', player.currentTrack?.id === track.id ? 'text-orange-400' : 'text-slate-100']">
                {{ track.title }}
              </h4>
              <p class="text-xs text-slate-400 truncate">{{ track.artist_name }}</p>
            </div>
            <CheckCircle2 v-if="track.download_status === 'downloaded'" class="w-4 h-4 text-emerald-400 shrink-0" title="Downloaded offline" />
          </div>

          <!-- Album -->
          <div class="hidden sm:block col-span-3 text-xs text-slate-400 truncate">
            {{ track.album_title || '-' }}
          </div>

          <!-- Duration -->
          <div class="col-span-3 sm:col-span-2 text-end text-xs font-mono text-slate-400">
            {{ formatDuration(track.duration_ms) }}
          </div>

          <!-- Actions -->
          <div class="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
            <button
              @click.stop="player.toggleFavorite(track)"
              class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
            >
              <Heart :class="['w-4 h-4', track.is_favorite ? 'fill-red-500 text-red-500' : '']" />
            </button>
            <button
              @click.stop="router.push(`/track/${track.id}`)"
              class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Track details"
            >
              <MoreVertical class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
