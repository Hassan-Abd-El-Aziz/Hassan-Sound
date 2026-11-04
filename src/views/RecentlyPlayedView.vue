<script setup lang="ts">
import { Clock, Play } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks } from '@/data/demoTracks'

const { t } = useI18n()
const player = usePlayerStore()
</script>

<template>
  <div class="space-y-6 pb-12">
    <div class="flex items-center gap-4 pb-4 border-b border-slate-800/60">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
        <Clock class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.recentlyPlayed.title') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.recentlyPlayed.subtitle') }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40">
      <div
        v-for="track in demoTracks.slice(0, 3)"
        :key="track.id"
        class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
        @click="player.playTrack(track)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0">
            <img :src="track.cover_url" alt="" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-white truncate">{{ track.title }}</h4>
            <p class="text-xs text-slate-400 truncate">{{ track.artist_name }}</p>
          </div>
        </div>
        <button class="p-2 text-orange-500 hover:text-orange-400">
          <Play class="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  </div>
</template>
