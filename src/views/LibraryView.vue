<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Play,
  Pause,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Music2
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { useCatalogStore } from '@/stores/catalog'
import type { Track } from '@/types'
import AppLoadingState from '@/components/common/AppLoadingState.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t, isRTL } = useI18n()
const player = usePlayerStore()
const catalog = useCatalogStore()
const router = useRouter()

// Edit Modal State
const editingTrack = ref<Track | null>(null)
const editTitle = ref('')
const editArtist = ref('')
const editAlbum = ref('')
const editYear = ref<number | undefined>()
const isSaving = ref(false)

// Delete Modal State
const deletingTrack = ref<Track | null>(null)
const isDeleting = ref(false)

onMounted(async () => {
  await catalog.fetchTracks(1)
})

watch([() => catalog.selectedSort, () => catalog.sortOrder], async () => {
  await catalog.fetchTracks(1)
})

let searchTimeout: any = null
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    catalog.fetchTracks(1)
  }, 300)
}

const formatDuration = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const isTrackPlaying = (track: Track) => {
  return player.currentTrack?.id === track.id && player.isPlaying
}

// Edit Handlers
const openEditModal = (track: Track) => {
  editingTrack.value = track
  editTitle.value = track.title
  editArtist.value = track.artist_name || ''
  editAlbum.value = track.album_title || ''
  editYear.value = track.release_year
}

const saveEdit = async () => {
  if (!editingTrack.value || !editTitle.value.trim()) return
  isSaving.value = true
  try {
    await catalog.updateTrack(editingTrack.value.id, {
      title: editTitle.value.trim(),
      artist_name: editArtist.value.trim(),
      album_title: editAlbum.value.trim(),
      release_year: editYear.value
    })
    editingTrack.value = null
  } finally {
    isSaving.value = false
  }
}

// Delete Handlers
const confirmDelete = async () => {
  if (!deletingTrack.value) return
  isDeleting.value = true
  try {
    await catalog.deleteTrack(deletingTrack.value)
    deletingTrack.value = null
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span>{{ t('views.library.title') }}</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-orange-400 font-mono font-medium">
            {{ catalog.totalTracks }}
          </span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.library.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Live Search -->
        <div class="relative flex-1 sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
          <input
            v-model="catalog.searchQuery"
            @input="onSearchInput"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            class="w-full h-9 ps-9 pe-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-orange-500/60"
          />
        </div>

        <!-- Sort Select -->
        <select
          v-model="catalog.selectedSort"
          class="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500/60"
        >
          <option value="title">العنوان (Title)</option>
          <option value="artist">الفنان (Artist)</option>
          <option value="duration">المدة (Duration)</option>
          <option value="created_at">تاريخ الإضافة (Date Added)</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <AppLoadingState v-if="catalog.isLoading && catalog.tracks.length === 0" />

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="catalog.tracks.length === 0"
      :title="catalog.searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'مكتبتك الصوتية فارغة'"
      :description="catalog.searchQuery ? 'جرب البحث بكلمات مختلفة أو اسم فنان آخر.' : 'ابدأ برفع أغانيك الأولى من مدير الرفع الآن.'"
      :action-label="catalog.searchQuery ? '' : 'انتقل لمدير الرفع'"
      @action="router.push('/upload')"
    />

    <!-- Track List Table -->
    <div v-else class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-sm">
      <div class="grid grid-cols-12 px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/60">
        <div class="col-span-1 text-center">#</div>
        <div class="col-span-6 sm:col-span-5">العنوان / المسار</div>
        <div class="hidden sm:block col-span-3">الألبوم</div>
        <div class="col-span-3 sm:col-span-2 text-end flex items-center justify-end gap-1">
          <Clock class="w-3.5 h-3.5" />
          <span>المدة</span>
        </div>
        <div class="col-span-2 sm:col-span-1 text-end">إجراءات</div>
      </div>

      <div class="divide-y divide-slate-800/40">
        <div
          v-for="(track, idx) in catalog.tracks"
          :key="track.id"
          :class="[
            'grid grid-cols-12 items-center px-4 py-3 text-sm transition group cursor-pointer',
            player.currentTrack?.id === track.id ? 'bg-orange-500/10' : 'hover:bg-slate-800/50'
          ]"
          @click="player.playTrack(track, catalog.tracks)"
        >
          <!-- Track Number / Play Indicator -->
          <div class="col-span-1 text-center font-mono text-xs text-slate-400">
            <span class="group-hover:hidden">
              <span v-if="isTrackPlaying(track)" class="text-orange-500 font-bold">▶</span>
              <span v-else>{{ (catalog.currentPage - 1) * catalog.pageSize + idx + 1 }}</span>
            </span>
            <button class="hidden group-hover:inline-flex text-orange-500 transition">
              <Pause v-if="isTrackPlaying(track)" class="w-4 h-4 fill-current" />
              <Play v-else class="w-4 h-4 fill-current" />
            </button>
          </div>

          <!-- Title & Artist & Artwork -->
          <div class="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
              <img v-if="track.cover_url" :src="track.cover_url" alt="" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
                <Music2 class="w-5 h-5" />
              </div>
            </div>
            <div class="min-w-0">
              <h4 :class="['text-sm font-semibold truncate', player.currentTrack?.id === track.id ? 'text-orange-400' : 'text-slate-100']">
                {{ track.title }}
              </h4>
              <p class="text-xs text-slate-400 truncate">{{ track.artist_name || 'فنان غير معروف' }}</p>
            </div>
            <CheckCircle2 v-if="track.download_status === 'downloaded'" class="w-4 h-4 text-emerald-400 shrink-0" title="Offline" />
          </div>

          <!-- Album -->
          <div class="hidden sm:block col-span-3 text-xs text-slate-400 truncate">
            {{ track.album_title || '-' }}
          </div>

          <!-- Duration -->
          <div class="col-span-3 sm:col-span-2 text-end text-xs font-mono text-slate-400">
            {{ formatDuration(track.duration_ms) }}
          </div>

          <!-- Row Action Menu -->
          <div class="col-span-2 sm:col-span-1 flex items-center justify-end gap-1" @click.stop>
            <button
              @click="openEditModal(track)"
              class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="تعديل البيانات الوصفية"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              @click="deletingTrack = track"
              class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
              title="حذف الأغنية"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="catalog.totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-t border-slate-800/60 text-xs text-slate-400">
        <span>صفحة {{ catalog.currentPage }} من {{ catalog.totalPages }}</span>
        <div class="flex items-center gap-2">
          <button
            :disabled="catalog.currentPage <= 1"
            @click="catalog.fetchTracks(catalog.currentPage - 1)"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
          >
            <component :is="isRTL ? ChevronRight : ChevronLeft" class="w-4 h-4" />
          </button>
          <button
            :disabled="catalog.currentPage >= catalog.totalPages"
            @click="catalog.fetchTracks(catalog.currentPage + 1)"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
          >
            <component :is="isRTL ? ChevronLeft : ChevronRight" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Metadata Modal -->
    <div
      v-if="editingTrack"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="editingTrack = null"
    >
      <div class="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-lg font-bold text-white">تعديل بيانات الأغنية</h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">عنوان المسار</label>
            <input v-model="editTitle" class="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">الفنان</label>
            <input v-model="editArtist" class="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">الألبوم</label>
            <input v-model="editAlbum" class="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">سنة الإصدار</label>
            <input v-model.number="editYear" type="number" class="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="editingTrack = null"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            إلغاء
          </button>
          <button
            @click="saveEdit"
            :disabled="isSaving"
            class="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-400 text-white"
          >
            {{ isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingTrack"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="deletingTrack = null"
    >
      <div class="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-red-900/40 shadow-2xl space-y-4">
        <div class="flex items-center gap-3 text-red-400">
          <AlertTriangle class="w-6 h-6" />
          <h3 class="text-lg font-bold text-white">تأكيد حذف الأغنية</h3>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          هل أنت متأكد من حذف <strong class="text-white">"{{ deletingTrack.title }}"</strong>؟
          سيؤدي هذا إلى حذف سجل الأغنية من قاعدة البيانات، وحذف الملف الصوتي من التخزين السحابي الخاص، وإزالتها من قوائم التشغيل والتنزيلات المحلية.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="deletingTrack = null"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            إلغاء
          </button>
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
          >
            {{ isDeleting ? 'جاري الحذف...' : 'حذف نهائي' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
