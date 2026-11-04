<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

withDefaults(defineProps<{
  title?: string
  message?: string
  retryable?: boolean
}>(), {
  title: '',
  message: '',
  retryable: false
})

defineEmits<{
  (e: 'retry'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-xl bg-red-950/40 border border-red-800/60 p-4 flex items-start gap-3 text-red-200 my-4 shadow-sm">
    <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold text-red-300">
        {{ title || t('common.errorTitle') }}
      </h4>
      <p class="text-xs text-red-300/80 mt-0.5 leading-relaxed">
        {{ message || t('common.errorDescription') }}
      </p>
    </div>
    <button
      v-if="retryable"
      @click="$emit('retry')"
      class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900/60 hover:bg-red-800/80 text-red-100 transition active:scale-95"
    >
      <RefreshCw class="w-3.5 h-3.5" />
      <span>{{ t('common.retry') }}</span>
    </button>
  </div>
</template>
