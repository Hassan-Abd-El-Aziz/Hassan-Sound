<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ListMusic, Plus, Play, Trash2, Music2, Clock, X, ChevronRight, ChevronLeft } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { useCollectionsStore } from '@/stores/collections'
import { usePlayerStore } from '@/stores/player'
import type { Playlist, Track } from '@/types'
import AppLoadingState from '@/components/common/AppLoadingState.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t, isRTL } = useI18n()
const collections = useCollectionsStore()
const player = usePlayerStore()

// Modal states
const showCreateModal = ref(false)
const newTitle = ref('')
const newDesc = ref('')
const isCreating = ref(false)

// Active playlist inspection
const activePlaylist = ref<Playlist | null>(null)
const activeTracks = ref<Track[]>([])
const isLoadingTracks = ref(false)

onMounted(async () => {
  await collections.loadPlaylists()
})

const handleCreate = async () => {
  if (!newTitle.value.trim()) return
  isCreating.value = true
  try {
    await collections.createPlaylist(newTitle.value.trim(), newDesc.value.trim())
    newTitle.value = ''
    newDesc.value = ''
    showCreateModal.value = false
  } finally {
    isCreating.value = false
  }
}

const openPlaylist = async (pl: Playlist) => {
  activePlaylist.value = pl
  isLoadingTracks.value = true
  try {
    activeTracks.value = await collections.loadPlaylistTracks(pl.id)
  } finally {
    isLoadingTracks.value = false
  }
}

const playEntirePlaylist = () => {
  if (activeTracks.value.length > 0) {
    player.playTrack(activeTracks.value[0], activeTracks.value)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('هل أنت متأكد من حذف قائمة التشغيل هذه؟')) {
    await collections.deletePlaylist(id)
    if (activePlaylist.value?.id === id) {
      activePlaylist.value = null
      activeTracks.value = []
    }
  }
}

const handleRemoveTrack = async (trackId: string) => {
  if (!activePlaylist.value) return
  await collections.removeTrackFromPlaylist(activePlaylist.value.id, trackId)
  activeTracks.value = activeTracks.value.filter(t => t.id !== trackId)
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
    <div class="flex items-center justify-between pb-4 border-b border-slate-800/60">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span>{{ t('views.playlists.title') }}</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-orange-400 font-mono font-medium">
            {{ collections.playlists.length }}
          </span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.playlists.subtitle') }}</p>
      </div>

      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>{{ t('views.playlists.newPlaylist') }}</span>
      </button>
    </div>

    <!-- Active Playlist Drawer/View -->
    <div v-if="activePlaylist" class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div class="flex items-center gap-4">
          <button
            @click="activePlaylist = null"
            class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="رجوع للقوائم"
          >
            <component :is="isRTL ? ChevronRight : ChevronLeft" class="w-5 h-5" />
          </button>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-orange-400">قائمة تشغيل</span>
            <h2 class="text-xl sm:text-2xl font-bold text-white">{{ activePlaylist.title }}</h2>
            <p v-if="activePlaylist.description" class="text-xs text-slate-400 mt-0.5">{{ activePlaylist.description }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="activeTracks.length > 0"
            @click="playEntirePlaylist"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 transition active:scale-95"
          >
            <Play class="w-4 h-4 fill-current" />
            <span>تشغيل الكل</span>
          </button>
          <button
            @click="handleDelete(activePlaylist.id)"
            class="p-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition"
            title="حذف القائمة"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Playlist Tracks -->
      <AppLoadingState v-if="isLoadingTracks" />
      <AppEmptyState
        v-else-if="activeTracks.length === 0"
        title="القائمة فارغة"
        description="لم تقم بإضافة أي أغنية لهذه القائمة بعد. يمكنك إضافة الأغاني مباشرة من المكتبة."
      />
      <div v-else class="divide-y divide-slate-800/40">
        <div
          v-for="(track, idx) in activeTracks"
          :key="track.id"
          class="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/50 transition cursor-pointer"
          @click="player.playTrack(track, activeTracks)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-mono text-slate-400 w-4 text-center">{{ idx + 1 }}</span>
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
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
              @click.stop="handleRemoveTrack(track.id)"
              class="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
              title="إزالة من القائمة"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Playlists Grid -->
    <div v-else>
      <AppLoadingState v-if="collections.isLoading" />
      <AppEmptyState
        v-else-if="collections.playlists.length === 0"
        title="لا توجد قوائم تشغيل"
        description="أنشئ قائمة تشغيل جديدة لتنظيم أغانيك المفضلة حسب رغبتك."
        action-label="إنشاء أول قائمة"
        @action="showCreateModal = true"
      />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="pl in collections.playlists"
          :key="pl.id"
          class="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 transition group cursor-pointer"
          @click="openPlaylist(pl)"
        >
          <div class="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow flex items-center justify-center text-orange-400">
            <img v-if="pl.cover_url" :src="pl.cover_url" alt="" class="w-full h-full object-cover group-hover:scale-105 transition" />
            <ListMusic v-else class="w-8 h-8" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Play class="w-7 h-7 text-white fill-current" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-white group-hover:text-orange-400 transition truncate">
              {{ pl.title }}
            </h4>
            <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">{{ pl.description || 'قائمة خاصة' }}</p>
            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 mt-2">
              <ListMusic class="w-3.5 h-3.5" />
              <span>{{ pl.track_count || 0 }} {{ t('common.tracksCount', { count: '' }) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Playlist Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <ListMusic class="w-5 h-5 text-orange-500" />
          <span>إنشاء قائمة تشغيل جديدة</span>
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">اسم القائمة</label>
            <input
              v-model="newTitle"
              placeholder="مثال: موسيقى الصباح والتركيز"
              class="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">الوصف (اختياري)</label>
            <textarea
              v-model="newDesc"
              rows="3"
              placeholder="أضف وصفاً مختصراً للقائمة..."
              class="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-orange-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            إلغاء
          </button>
          <button
            @click="handleCreate"
            :disabled="isCreating || !newTitle.trim()"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-400 text-white shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50"
          >
            {{ isCreating ? 'جاري الإنشاء...' : 'إنشاء القائمة' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
