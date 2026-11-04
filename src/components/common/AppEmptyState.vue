<script setup lang="ts">
import { Music2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

withDefaults(defineProps<{
  title?: string
  description?: string
  actionLabel?: string
}>(), {
  title: '',
  description: '',
  actionLabel: ''
})

defineEmits<{
  (e: 'action'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 my-4">
    <div class="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-orange-500 mb-4 shadow-inner">
      <slot name="icon">
        <Music2 class="w-8 h-8 opacity-80" />
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-slate-100 mb-1">
      {{ title || t('common.emptyTitle') }}
    </h3>
    <p class="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
      {{ description || t('common.emptyDescription') }}
    </p>
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-medium hover:from-orange-500 hover:to-orange-400 transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
