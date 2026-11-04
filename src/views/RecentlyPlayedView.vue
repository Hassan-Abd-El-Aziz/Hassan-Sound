<script setup lang="ts">
import { onMounted } from 'vue'
import { Clock, Play, Music2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { useCollectionsStore } from '@/stores/collections'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t } = useI18n()
const player = usePlayerStore()
const collections = useCollectionsStore()

onMounted(async () => {
  await collections.loadHistory()
})

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
</script>

<template>
  <div class="space-y-6 pb-12 select-none">
    <div class="flex items-center gap-4 pb-4 border-b border-slate-800/60">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
        <Clock class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.recentlyPlayed.title') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.recentlyPlayed.subtitle') }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-if="collections.recentlyPlayedTracks.length === 0"
      :title="t('views.recentlyPlayed.title')"
      description="لم تقم بالاستماع لأي أغنية بعد. شغل أغنيتك المفضلة وستظهر هنا تلقائياً."
    />

    <!-- List -->
    <div v-else class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40 shadow-sm">
      <div
        v-for="track in collections.recentlyPlayedTracks"
        :key="track.id"
        class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
        @click="player.playTrack(track, collections.recentlyPlayedTracks)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
            <img v-if="track.cover_url" :src="track.cover_url" alt="" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
              <Music2 class="w-5 h-5" />
            </div>
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-white truncate">{{ track.title }}</h4>
            <p class="text-xs text-slate-400 truncate">{{ track.artist_name || 'فنان غير معروف' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-xs font-mono text-slate-400">
            {{ formatDuration(track.duration_ms) }}
          </span>
          <button class="p-2 text-orange-500 hover:text-orange-400 transition active:scale-95">
            <Play class="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
