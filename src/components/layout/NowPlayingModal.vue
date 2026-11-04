<script setup lang="ts">
import { ref } from 'vue'
import {
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Trash2,
  Music2,
  Download,
  CheckCircle2
} from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/player'
import { useI18n } from '@/i18n'

const player = usePlayerStore()
const { t } = useI18n()
const showQueue = ref(false)

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
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-250 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="player.isNowPlayingOpen"
      class="fixed inset-0 z-50 bg-gradient-to-b from-slate-900/98 via-slate-950 to-black text-slate-100 flex flex-col overflow-hidden backdrop-blur-2xl"
    >
      <!-- Top Bar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800/40">
        <button
          @click="player.closeNowPlaying()"
          class="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition active:scale-95"
          :title="t('common.close')"
        >
          <ChevronDown class="w-6 h-6" />
        </button>

        <div class="text-center">
          <span class="text-xs uppercase font-bold tracking-widest text-orange-500">
            {{ t('player.nowPlaying') }}
          </span>
          <p class="text-xs text-slate-400 truncate max-w-xs mt-0.5">
            {{ player.currentTrack?.album_title || t('player.unknownAlbum') }}
          </p>
        </div>

        <button
          @click="showQueue = !showQueue"
          :class="[
            'p-2 rounded-xl transition active:scale-95',
            showQueue ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          ]"
          :title="t('player.queue')"
        >
          <ListMusic class="w-6 h-6" />
        </button>
      </div>

      <!-- Main Body Container -->
      <div class="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-between max-w-lg mx-auto w-full">
        <!-- View Mode: Queue Drawer vs Artwork & Player -->
        <div v-if="showQueue" class="w-full flex-1 flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 class="font-bold text-base text-slate-200 flex items-center gap-2">
              <ListMusic class="w-5 h-5 text-orange-400" />
              <span>{{ t('player.queue') }} ({{ player.queue.length }})</span>
            </h3>
            <button
              v-if="player.queue.length > 0"
              @click="player.clearQueue()"
              class="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 p-1 hover:bg-red-950/30 rounded"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>{{ t('common.delete') }}</span>
            </button>
          </div>

          <div v-if="player.queue.length === 0" class="text-center py-16 text-slate-400 text-sm">
            {{ t('player.emptyQueue') }}
          </div>

          <div v-else class="space-y-2 overflow-y-auto max-h-[50vh]">
            <div
              v-for="(track, idx) in player.queue"
              :key="track.id + idx"
              :class="[
                'flex items-center justify-between p-3 rounded-xl transition cursor-pointer',
                player.queueIndex === idx ? 'bg-orange-500/15 border border-orange-500/30' : 'hover:bg-slate-800/50'
              ]"
              @click="player.playTrack(track)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xs font-mono text-slate-400 w-4 text-center">{{ idx + 1 }}</span>
                <div class="min-w-0">
                  <h5 :class="['text-sm font-semibold truncate', player.queueIndex === idx ? 'text-orange-400' : 'text-slate-100']">
                    {{ track.title }}
                  </h5>
                  <p class="text-xs text-slate-400 truncate">{{ track.artist_name || t('player.unknownArtist') }}</p>
                </div>
              </div>
              <button
                @click.stop="player.removeFromQueue(idx)"
                class="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="w-full flex-1 flex flex-col items-center justify-around">
          <!-- Album Artwork -->
          <div class="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900 group my-4">
            <img
              v-if="player.currentTrack?.cover_url"
              :src="player.currentTrack.cover_url"
              alt="Artwork"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-600 bg-gradient-to-tr from-slate-900 to-slate-800">
              <Music2 class="w-24 h-24 stroke-1 text-slate-500/60" />
            </div>
          </div>

          <!-- Metadata & Favorite -->
          <div class="w-full flex items-center justify-between mt-4">
            <div class="min-w-0 flex-1">
              <h2 class="text-xl sm:text-2xl font-bold text-white truncate">
                {{ player.currentTrack?.title || t('player.emptyQueue') }}
              </h2>
              <p class="text-sm sm:text-base text-slate-400 truncate mt-1">
                {{ player.currentTrack?.artist_name || t('player.unknownArtist') }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="player.currentTrack"
                @click="player.toggleFavorite()"
                class="p-2.5 rounded-full hover:bg-slate-800/80 transition active:scale-90"
              >
                <Heart
                  :class="[
                    'w-6 h-6 transition-colors',
                    player.currentTrack.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-white'
                  ]"
                />
              </button>
              <button
                v-if="player.currentTrack"
                class="p-2.5 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-orange-400 transition active:scale-90"
                :title="t('player.download')"
              >
                <CheckCircle2 v-if="player.currentTrack.download_status === 'downloaded'" class="w-6 h-6 text-emerald-400" />
                <Download v-else class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Waveform / Progress Slider -->
          <div class="w-full mt-6">
            <div
              class="relative h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group hover:h-3 transition-all"
              @click="handleSeek"
            >
              <div
                class="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 rounded-full"
                :style="{ width: `${player.progressPercent}%` }"
              ></div>
            </div>
            <div class="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
              <span>{{ player.formattedCurrentTime }}</span>
              <span>{{ player.formattedDuration }}</span>
            </div>
          </div>

          <!-- Transport Controls -->
          <div class="w-full flex items-center justify-between mt-6 px-2">
            <!-- Shuffle -->
            <button
              @click="player.toggleShuffle()"
              :class="[
                'p-3 rounded-full transition active:scale-95',
                player.shuffle ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              ]"
              :title="t('player.shuffle')"
            >
              <Shuffle class="w-5 h-5" />
            </button>

            <!-- Previous -->
            <button
              @click="player.prevTrack()"
              class="p-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-full transition active:scale-90"
              :title="t('player.previous')"
            >
              <SkipBack class="w-7 h-7" />
            </button>

            <!-- Play / Pause -->
            <button
              @click="player.togglePlay()"
              class="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white flex items-center justify-center shadow-xl shadow-orange-500/30 transition-transform active:scale-95"
              :title="player.isPlaying ? t('player.pause') : t('player.play')"
            >
              <Pause v-if="player.isPlaying" class="w-8 h-8 fill-current" />
              <Play v-else class="w-8 h-8 fill-current ms-1" />
            </button>

            <!-- Next -->
            <button
              @click="player.nextTrack()"
              class="p-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-full transition active:scale-90"
              :title="t('player.next')"
            >
              <SkipForward class="w-7 h-7" />
            </button>

            <!-- Repeat -->
            <button
              @click="player.cycleRepeatMode()"
              :class="[
                'p-3 rounded-full transition active:scale-95',
                player.repeatMode !== 'off' ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              ]"
              :title="t('player.repeat')"
            >
              <Repeat1 v-if="player.repeatMode === 'one'" class="w-5 h-5" />
              <Repeat v-else class="w-5 h-5" />
            </button>
          </div>

          <!-- Volume Controls -->
          <div class="w-full flex items-center justify-center gap-3 mt-6 px-4">
            <button
              @click="player.toggleMute()"
              class="text-slate-400 hover:text-white p-2"
            >
              <VolumeX v-if="player.isMuted || player.volume === 0" class="w-5 h-5 text-red-400" />
              <Volume2 v-else class="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              :value="player.isMuted ? 0 : player.volume"
              @input="(e: any) => player.setVolume(Number(e.target.value))"
              class="w-48 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
