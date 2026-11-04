<script setup lang="ts">
import { Users2, Music2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { demoArtists } from '@/data/demoTracks'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6 pb-12">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.artists.title') }}</h1>
      <p class="text-sm text-slate-400 mt-1">{{ t('views.artists.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="artist in demoArtists"
        :key="artist.id"
        class="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 transition group cursor-pointer"
      >
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300 shadow-xl border border-slate-700/60 mb-3 text-orange-400">
          <Users2 class="w-10 h-10" />
        </div>
        <h4 class="text-sm sm:text-base font-semibold text-white group-hover:text-orange-400 transition truncate w-full">
          {{ artist.name }}
        </h4>
        <p class="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-center">
          <Music2 class="w-3.5 h-3.5" />
          <span>{{ artist.track_count }} {{ t('common.tracksCount', { count: '' }) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
