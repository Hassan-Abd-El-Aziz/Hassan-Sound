<script setup lang="ts">
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  Maximize2,
  Music2,
  Repeat,
  Repeat1,
  Shuffle
} from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/player'
import { useI18n } from '@/i18n'

const player = usePlayerStore()
const { t } = useI18n()

const handleSeek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, clickX / rect.width))
  if (player.duration > 0) {
    player.seekTo(percent * player.duration)
  }
}
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-14 md:bottom-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl transition-all duration-300"
  >
    <!-- Progress Bar (interactive on hover) -->
    <div
      class="group relative h-1.5 w-full bg-slate-800 cursor-pointer overflow-hidden transition-all hover:h-2.5"
      @click="handleSeek"
      title="Seek"
    >
      <div
        class="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 rounded-e-full transition-[width] duration-150"
        :style="{ width: `${player.progressPercent}%` }"
      ></div>
    </div>

    <!-- Controls Body -->
    <div class="h-16 md:h-20 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 max-w-7xl mx-auto">
      <!-- Track Info (Click to open full player) -->
      <div
        class="flex items-center gap-3 min-w-0 flex-1 md:flex-initial md:w-72 cursor-pointer group select-none"
        @click="player.openNowPlaying()"
      >
        <div class="relative w-11 h-11 md:w-14 md:h-14 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700/50 shadow-md">
          <img
            v-if="player.currentTrack?.cover_url"
            :src="player.currentTrack.cover_url"
            alt="Track Cover"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors">
            <Music2 class="w-6 h-6" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h4 class="text-xs md:text-sm font-semibold text-slate-100 truncate group-hover:text-orange-400 transition-colors">
              {{ player.currentTrack?.title || t('player.emptyQueue') }}
            </h4>
          </div>
          <p class="text-[11px] md:text-xs text-slate-400 truncate mt-0.5">
            {{ player.currentTrack?.artist_name || (player.currentTrack ? t('player.unknownArtist') : 'MySound Player') }}
          </p>
        </div>

        <button
          v-if="player.currentTrack"
          @click.stop="player.toggleFavorite()"
          class="hidden sm:flex text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition active:scale-90"
          :title="player.currentTrack.is_favorite ? t('player.unfavorite') : t('player.favorite')"
        >
          <Heart
            class="w-4 h-4 transition-colors"
            :class="player.currentTrack.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'"
          />
        </button>
      </div>

      <!-- Center Player Controls -->
      <div class="flex flex-col items-center justify-center gap-1">
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Shuffle (Desktop) -->
          <button
            @click="player.toggleShuffle()"
            class="hidden md:flex p-2 text-slate-400 hover:text-slate-200 transition active:scale-95 rounded-lg hover:bg-slate-800"
            :class="{ 'text-orange-500 font-bold': player.shuffle }"
            :title="t('player.shuffle')"
          >
            <Shuffle class="w-4 h-4" />
          </button>

          <!-- Previous -->
          <button
            @click="player.prevTrack()"
            class="p-2 text-slate-300 hover:text-white transition active:scale-90 rounded-lg hover:bg-slate-800"
            :title="t('player.previous')"
          >
            <SkipBack class="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <!-- Play / Pause Main Button -->
          <button
            @click="player.togglePlay()"
            class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 transition-transform duration-200 active:scale-95"
            :title="player.isPlaying ? t('player.pause') : t('player.play')"
          >
            <Pause v-if="player.isPlaying" class="w-5 h-5 md:w-6 md:h-6 fill-current" />
            <Play v-else class="w-5 h-5 md:w-6 md:h-6 fill-current ms-0.5" />
          </button>

          <!-- Next -->
          <button
            @click="player.nextTrack()"
            class="p-2 text-slate-300 hover:text-white transition active:scale-90 rounded-lg hover:bg-slate-800"
            :title="t('player.next')"
          >
            <SkipForward class="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <!-- Repeat (Desktop) -->
          <button
            @click="player.cycleRepeatMode()"
            class="hidden md:flex p-2 text-slate-400 hover:text-slate-200 transition active:scale-95 rounded-lg hover:bg-slate-800"
            :class="{ 'text-orange-500 font-bold': player.repeatMode !== 'off' }"
            :title="t('player.repeat')"
          >
            <Repeat1 v-if="player.repeatMode === 'one'" class="w-4 h-4" />
            <Repeat v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Time Counters (Desktop) -->
        <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono tracking-wider">
          <span>{{ player.formattedCurrentTime }}</span>
          <span>/</span>
          <span>{{ player.formattedDuration }}</span>
        </div>
      </div>

      <!-- Right Controls: Volume & Expand -->
      <div class="flex items-center justify-end gap-3 flex-1 md:flex-initial md:w-72">
        <!-- Volume Control (Desktop) -->
        <div class="hidden lg:flex items-center gap-2">
          <button
            @click="player.toggleMute()"
            class="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            :title="player.isMuted ? t('player.unmute') : t('player.mute')"
          >
            <VolumeX v-if="player.isMuted || player.volume === 0" class="w-4 h-4 text-red-400" />
            <Volume2 v-else class="w-4 h-4" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            :value="player.isMuted ? 0 : player.volume"
            @input="(e: any) => player.setVolume(Number(e.target.value))"
            class="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <!-- Expand to Fullscreen Now Playing Button -->
        <button
          @click="player.openNowPlaying()"
          class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition active:scale-95"
          :title="t('player.nowPlaying')"
        >
          <Maximize2 class="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
