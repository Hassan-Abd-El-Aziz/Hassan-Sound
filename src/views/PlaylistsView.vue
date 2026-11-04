<script setup lang="ts">
import { ListMusic, Plus, Play } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { demoPlaylists } from '@/data/demoTracks'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6 pb-12">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800/60">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.playlists.title') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.playlists.subtitle') }}</p>
      </div>

      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>{{ t('views.playlists.newPlaylist') }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="pl in demoPlaylists"
        :key="pl.id"
        class="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 transition group cursor-pointer"
      >
        <div class="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow">
          <img :src="pl.cover_url" alt="" class="w-full h-full object-cover group-hover:scale-105 transition" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <Play class="w-7 h-7 text-white fill-current" />
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-semibold text-white group-hover:text-orange-400 transition truncate">
            {{ pl.title }}
          </h4>
          <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">{{ pl.description }}</p>
          <span class="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 mt-2">
            <ListMusic class="w-3.5 h-3.5" />
            <span>{{ pl.track_count }} {{ t('common.tracksCount', { count: '' }) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
