<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

withDefaults(defineProps<{
  text?: string
}>(), {
  text: ''
})

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center text-slate-400">
    <Loader2 class="w-10 h-10 text-orange-500 animate-spin mb-4" />
    <span class="text-sm font-medium tracking-wide">
      {{ text || t('common.loading') }}
    </span>
  </div>
</template>
