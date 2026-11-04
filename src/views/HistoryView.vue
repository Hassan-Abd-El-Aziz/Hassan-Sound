<script setup lang="ts">
import { onMounted } from 'vue'
import { History, Play, Music2, CheckCircle2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { usePlayerStore } from '@/stores/player'
import { useCollectionsStore } from '@/stores/collections'
import AppEmptyState from '@/components/common/AppEmptyState.vue'

const { t } = useI18n()
const player = usePlayerStore()
const collections = useCollectionsStore()

onMounted(async () => {
  await collections.loadHistory()
})

const formatTime = (isoString: string) => {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'اليوم (Today)'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="space-y-6 pb-12 select-none">
    <div class="flex items-center gap-4 pb-4 border-b border-slate-800/60">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
        <History class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span>{{ t('views.history.title') }}</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-purple-400 font-mono font-medium">
            {{ collections.history.length }}
          </span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('views.history.subtitle') }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-if="collections.history.length === 0"
      :title="t('views.history.title')"
      description="سجل الاستماع فارغ حالياً. استمتع بمكتبتك الصوتية وستُسجل جلساتك هنا."
    />

    <!-- History Timeline List -->
    <div v-else class="space-y-4">
      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/40 shadow-sm">
        <div
          v-for="entry in collections.history"
          :key="entry.id"
          class="flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition cursor-pointer"
          @click="entry.track && player.playTrack(entry.track)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
              <img v-if="entry.track?.cover_url" :src="entry.track.cover_url" alt="" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
                <Music2 class="w-5 h-5" />
              </div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold text-white truncate">{{ entry.track?.title || 'أغنية سابقة' }}</h4>
                <span v-if="entry.completed" class="flex items-center text-[10px] text-emerald-400 gap-1 font-medium">
                  <CheckCircle2 class="w-3 h-3" />
                  <span>اكتملت</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 truncate">{{ entry.track?.artist_name || 'فنان غير معروف' }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-end">
              <span class="block text-xs font-mono text-slate-300">{{ formatTime(entry.played_at) }}</span>
              <span class="block text-[10px] text-slate-400">{{ formatDate(entry.played_at) }}</span>
            </div>
            <button class="p-1.5 text-orange-500 hover:text-orange-400 transition active:scale-95">
              <Play class="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
