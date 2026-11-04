<script setup lang="ts">
import { Play, Heart, DownloadCloud, Upload, ListMusic } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { demoTracks, demoAlbums } from '@/data/demoTracks'

const { t } = useI18n()
const player = usePlayerStore()
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600/30 via-orange-950/20 to-slate-900 border border-orange-500/30 p-6 sm:p-10 shadow-2xl">
      <div class="relative z-10 max-w-xl">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
          {{ t('app.tagline') }}
        </span>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {{ t('views.home.welcome') }}
        </h1>
        <p class="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
          {{ t('views.home.subtitle') }}
        </p>

        <!-- Quick Action Buttons -->
        <div class="flex flex-wrap items-center gap-3 mt-6">
          <button
            @click="player.playTrack(demoTracks[0], demoTracks)"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-500/30 transition active:scale-95 text-sm"
          >
            <Play class="w-4 h-4 fill-current" />
            <span>{{ t('player.play') }} (Demo)</span>
          </button>
          <router-link
            to="/upload"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium border border-slate-700/60 transition active:scale-95 text-sm"
          >
            <Upload class="w-4 h-4 text-orange-400" />
            <span>{{ t('nav.upload') }}</span>
          </router-link>
        </div>
      </div>
      <!-- Background subtle glow -->
      <div class="absolute -end-16 -top-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
    </div>

    <!-- Quick Navigation Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <router-link
        to="/favorites"
        class="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition group"
      >
        <div class="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
          <Heart class="w-5 h-5 fill-red-500/40" />
        </div>
        <div class="min-w-0">
          <span class="block text-sm font-semibold text-white truncate">{{ t('nav.favorites') }}</span>
          <span class="text-xs text-slate-400">2 {{ t('common.tracksCount', { count: '' }) }}</span>
        </div>
      </router-link>

      <router-link
        to="/downloads"
        class="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition group"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
          <DownloadCloud class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-sm font-semibold text-white truncate">{{ t('nav.downloads') }}</span>
          <span class="text-xs text-slate-400">Offline</span>
        </div>
      </router-link>

      <router-link
        to="/playlists"
        class="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition group"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
          <ListMusic class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-sm font-semibold text-white truncate">{{ t('nav.playlists') }}</span>
          <span class="text-xs text-slate-400">2 Collections</span>
        </div>
      </router-link>

      <router-link
        to="/upload"
        class="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition group"
      >
        <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
          <Upload class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-sm font-semibold text-white truncate">{{ t('nav.upload') }}</span>
          <span class="text-xs text-slate-400">Supabase</span>
        </div>
      </router-link>
    </div>

    <!-- Recently Added Tracks Section -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-bold text-white">
          {{ t('views.home.recentlyAdded') }}
        </h2>
        <router-link to="/library" class="text-xs text-orange-400 hover:text-orange-300 font-medium">
          {{ t('common.all') }} →
        </router-link>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="track in demoTracks"
          :key="track.id"
          class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition group cursor-pointer"
          @click="player.playTrack(track, demoTracks)"
        >
          <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow">
            <img :src="track.cover_url" alt="" class="w-full h-full object-cover group-hover:scale-105 transition" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Play class="w-6 h-6 text-white fill-current" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-slate-100 truncate group-hover:text-orange-400 transition">
              {{ track.title }}
            </h4>
            <p class="text-xs text-slate-400 truncate mt-0.5">{{ track.artist_name }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Albums Grid -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-bold text-white">
          {{ t('views.albums.title') }}
        </h2>
        <router-link to="/albums" class="text-xs text-orange-400 hover:text-orange-300 font-medium">
          {{ t('common.all') }} →
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div
          v-for="album in demoAlbums"
          :key="album.id"
          class="p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 transition group cursor-pointer"
        >
          <div class="relative aspect-square rounded-xl overflow-hidden bg-slate-800 shadow-md mb-3">
            <img :src="album.cover_url" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
          <h4 class="text-sm font-semibold text-white truncate">{{ album.title }}</h4>
          <p class="text-xs text-slate-400 truncate mt-0.5">{{ album.artist_name }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
