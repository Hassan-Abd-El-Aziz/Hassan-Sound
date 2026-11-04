<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Home,
  Music2,
  Users2,
  Disc3,
  ListMusic,
  Heart,
  Clock,
  History,
  DownloadCloud,
  Upload,
  Settings,
  ShieldCheck,
  Languages,
  Wifi,
  WifiOff,
  Radio
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { useNetworkStore } from '@/stores/network'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { t, locale, toggleLocale } = useI18n()
const network = useNetworkStore()
const auth = useAuthStore()

const mainNavItems = computed(() => [
  { name: 'nav.home', path: '/', icon: Home },
  { name: 'nav.library', path: '/library', icon: Music2 },
  { name: 'nav.artists', path: '/artists', icon: Users2 },
  { name: 'nav.albums', path: '/albums', icon: Disc3 },
  { name: 'nav.playlists', path: '/playlists', icon: ListMusic },
  { name: 'nav.favorites', path: '/favorites', icon: Heart }
])

const collectionItems = computed(() => [
  { name: 'nav.recentlyPlayed', path: '/recently-played', icon: Clock },
  { name: 'nav.history', path: '/history', icon: History },
  { name: 'nav.downloads', path: '/downloads', icon: DownloadCloud },
  { name: 'nav.upload', path: '/upload', icon: Upload }
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900/90 border-e border-slate-800/80 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-30 select-none">
    <!-- Brand Header -->
    <div class="p-6 pb-4 flex items-center justify-between border-b border-slate-800/60">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/20">
          <Radio class="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
            MySound
          </h1>
          <div class="flex items-center gap-1 text-[11px] font-medium text-orange-400/90">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>{{ t('app.privateBadge') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation List (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      <!-- Main Nav -->
      <div class="space-y-1">
        <router-link
          v-for="item in mainNavItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            isActive(item.path)
              ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
              isActive(item.path) ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-200'
            ]"
          />
          <span>{{ t(item.name) }}</span>
        </router-link>
      </div>

      <!-- Collections / Storage -->
      <div class="pt-2 border-t border-slate-800/60">
        <div class="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          {{ t('views.home.quickActions') }}
        </div>
        <div class="space-y-1">
          <router-link
            v-for="item in collectionItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive(item.path)
                ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                isActive(item.path) ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-200'
              ]"
            />
            <span>{{ t(item.name) }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="p-4 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
      <!-- Status & Language -->
      <div class="flex items-center justify-between text-xs text-slate-400">
        <!-- Online / Offline pill -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
          <component
            :is="network.isOnline ? Wifi : WifiOff"
            :class="['w-3.5 h-3.5', network.isOnline ? 'text-emerald-400' : 'text-amber-400']"
          />
          <span :class="network.isOnline ? 'text-emerald-300' : 'text-amber-300'">
            {{ network.isOnline ? t('app.online') : t('app.offline') }}
          </span>
        </div>

        <!-- Language toggle button -->
        <button
          @click="toggleLocale"
          class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition active:scale-95 border border-slate-700/60"
          :title="locale === 'ar' ? 'Switch to English' : 'التحويل للعربية'"
        >
          <Languages class="w-3.5 h-3.5 text-orange-400" />
          <span class="font-bold">{{ locale === 'ar' ? 'English' : 'العربية' }}</span>
        </button>
      </div>

      <!-- Settings link -->
      <router-link
        to="/settings"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
          isActive('/settings')
            ? 'text-orange-400 bg-orange-500/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        ]"
      >
        <Settings class="w-4 h-4" />
        <span class="flex-1">{{ t('nav.settings') }}</span>
        <span v-if="auth.isAuthenticated" class="w-2 h-2 rounded-full bg-emerald-500"></span>
      </router-link>
    </div>
  </aside>
</template>
