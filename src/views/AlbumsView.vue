<script setup lang="ts">
import { Disc3, Calendar } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { demoAlbums } from '@/data/demoTracks'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6 pb-12">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.albums.title') }}</h1>
      <p class="text-sm text-slate-400 mt-1">{{ t('views.albums.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="album in demoAlbums"
        :key="album.id"
        class="p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 transition group cursor-pointer"
      >
        <div class="relative aspect-square rounded-xl overflow-hidden bg-slate-800 shadow-lg mb-3">
          <img :src="album.cover_url" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        </div>
        <h4 class="text-sm font-semibold text-white truncate group-hover:text-orange-400 transition">{{ album.title }}</h4>
        <p class="text-xs text-slate-400 truncate mt-0.5">{{ album.artist_name }}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
          <span class="flex items-center gap-1">
            <Disc3 class="w-3 h-3 text-orange-400" />
            <span>{{ album.track_count }} تراك</span>
          </span>
          <span class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            <span>{{ album.release_year }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
