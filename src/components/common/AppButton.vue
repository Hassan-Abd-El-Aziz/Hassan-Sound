<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm',
      variant === 'primary' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 shadow-md shadow-orange-500/20' : '',
      variant === 'secondary' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60' : '',
      variant === 'ghost' ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : '',
      variant === 'danger' ? 'bg-red-600/90 hover:bg-red-500 text-white' : ''
    ]"
  >
    <slot />
  </button>
</template>
