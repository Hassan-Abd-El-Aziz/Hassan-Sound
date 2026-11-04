<script setup lang="ts">
import { onMounted } from 'vue'
import { Heart, Play, Clock, Music2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { useCollectionsStore } from '@/stores/collections'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t } = useI18n()
const player = usePlayerStore()
const collections = useCollectionsStore()

onMounted(async () => {
  await collections.loadFavorites()
})

const playAllFavorites = () => {
  if (collections.favoriteTracks.length > 0) {
    player.playTrack(collections.favoriteTracks[0], collections.favoriteTracks)
  }
}

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
</script>

<template>
  <div class="space-y-6 pb-12 select-none">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
          <Heart class="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span>{{ t('views.favorites.title') }}</span>
            <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-red-400 font-mono font-medium">
              {{ collections.favoriteTracks.length }}
            </span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">{{ t('views.favorites.subtitle') }}</p>
        </div>
      </div>

      <button
        v-if="collections.favoriteTracks.length > 0"
        @click="playAllFavorites"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 transition active:scale-95"
      >
        <Play class="w-4 h-4 fill-current" />
        <span>تشغيل الكل</span>
      </button>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-if="collections.favoriteTracks.length === 0"
      :title="t('views.favorites.title')"
      description="لم تقم بإضافة أي أغنية للمفضلة بعد. انقر على رمز القلب في أي أغنية لتظهر هنا."
    >
      <template #icon>
        <Heart class="w-8 h-8 text-red-400" />
      </template>
    </AppEmptyState>

    <!-- Track List -->
    <div v-else class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-sm">
      <div
        v-for="(track, idx) in collections.favoriteTracks"
        :key="track.id"
        class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer border-b border-slate-800/40 last:border-b-0"
        @click="player.playTrack(track, collections.favoriteTracks)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-xs font-mono text-slate-400 w-4 text-center">{{ idx + 1 }}</span>
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
          <span class="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ formatDuration(track.duration_ms) }}</span>
          </span>
          <button
            @click.stop="collections.toggleFavorite(track)"
            class="p-2 text-red-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            title="إزالة من المفضلة"
          >
            <Heart class="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
