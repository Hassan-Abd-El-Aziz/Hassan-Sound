<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Radio, Languages, Wifi, WifiOff } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { useNetworkStore } from '@/stores/network'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const { t, locale, toggleLocale } = useI18n()
const network = useNetworkStore()
const auth = useAuthStore()

const pageTitle = computed(() => {
  const metaTitle = route.meta.title as string
  return metaTitle ? t(metaTitle) : t('app.name')
})
</script>

<template>
  <header class="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
    <!-- Mobile Brand / Desktop Title -->
    <div class="flex items-center gap-3">
      <!-- Mobile Logo -->
      <div class="flex md:hidden items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
          <Radio class="w-4 h-4" />
        </div>
        <span class="font-bold text-base text-white">MySound</span>
      </div>

      <!-- Desktop Page Title -->
      <h2 class="hidden md:block text-xl font-bold tracking-tight text-white">
        {{ pageTitle }}
      </h2>
    </div>

    <!-- Search input & status -->
    <div class="flex items-center gap-3">
      <!-- Desktop Search Bar -->
      <div class="hidden sm:flex items-center relative w-64 lg:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute start-3 pointer-events-none" />
        <input
          type="text"
          :placeholder="t('common.searchPlaceholder')"
          class="w-full h-9 ps-9 pe-4 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition"
        />
      </div>

      <!-- Mobile Online / Offline indicator -->
      <div class="flex md:hidden items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
        <component
          :is="network.isOnline ? Wifi : WifiOff"
          :class="['w-3.5 h-3.5', network.isOnline ? 'text-emerald-400' : 'text-amber-400']"
        />
      </div>

      <!-- Language Switcher (Mobile) -->
      <button
        @click="toggleLocale"
        class="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
        :title="locale === 'ar' ? 'English' : 'العربية'"
      >
        <Languages class="w-4 h-4 text-orange-400" />
      </button>

      <!-- Owner User Badge -->
      <div v-if="auth.isAuthenticated" class="flex items-center gap-2 ps-2 border-s border-slate-800">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow">
          {{ auth.user?.email.charAt(0).toUpperCase() || 'M' }}
        </div>
        <span class="hidden lg:block text-xs font-medium text-slate-300">
          {{ auth.user?.display_name }}
        </span>
      </div>
    </div>
  </header>
</template>
