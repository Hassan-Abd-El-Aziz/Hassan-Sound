<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Music2, ListMusic, DownloadCloud, Settings } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()

const navTabs = computed(() => [
  { name: 'nav.home', path: '/', icon: Home },
  { name: 'nav.library', path: '/library', icon: Music2 },
  { name: 'nav.playlists', path: '/playlists', icon: ListMusic },
  { name: 'nav.downloads', path: '/downloads', icon: DownloadCloud },
  { name: 'nav.settings', path: '/settings', icon: Settings }
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-safe">
    <div class="flex items-center justify-around">
      <router-link
        v-for="tab in navTabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-14',
          isActive(tab.path)
            ? 'text-orange-500 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        <component
          :is="tab.icon"
          :class="[
            'w-5 h-5 transition-transform duration-200',
            isActive(tab.path) ? 'scale-110 text-orange-500' : 'text-slate-400'
          ]"
        />
        <span class="text-[10px] mt-1 tracking-tight truncate max-w-16">
          {{ t(tab.name) }}
        </span>
      </router-link>
    </div>
  </nav>
</template>
