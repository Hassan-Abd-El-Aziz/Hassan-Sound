<script setup lang="ts">
import { History, Play, Calendar } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks } from '@/data/demoTracks'

const { t } = useI18n()
const player = usePlayerStore()
</script>

<template>
  <div class="space-y-6 pb-12">
    <div class="flex items-center gap-4 pb-4 border-b border-slate-800/60">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
        <History class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.history.title') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.history.subtitle') }}</p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
        <Calendar class="w-3.5 h-3.5 text-orange-400" />
        <span>اليوم (Today)</span>
      </div>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40">
        <div
          v-for="(track, idx) in demoTracks"
          :key="track.id + idx"
          class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
          @click="player.playTrack(track)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
              <img :src="track.cover_url" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-white truncate">{{ track.title }}</h4>
              <p class="text-xs text-slate-400 truncate">{{ track.artist_name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-mono">10:45 AM</span>
            <button class="p-1.5 text-orange-500 hover:text-orange-400">
              <Play class="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
