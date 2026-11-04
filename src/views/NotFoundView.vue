<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Disc3, Home } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
    <div class="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 shadow-2xl">
      <Disc3 class="w-10 h-10 animate-spin" style="animation-duration: 8s;" />
    </div>

    <div class="space-y-1">
      <h1 class="text-3xl font-extrabold text-white">404</h1>
      <h2 class="text-lg font-semibold text-slate-200">{{ t('views.notFound.title') }}</h2>
      <p class="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
        {{ t('views.notFound.description') }}
      </p>
    </div>

    <button
      @click="router.push('/')"
      class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs shadow-lg shadow-orange-500/25 transition active:scale-95"
    >
      <Home class="w-4 h-4" />
      <span>{{ t('views.notFound.backHome') }}</span>
    </button>
  </div>
</template>
