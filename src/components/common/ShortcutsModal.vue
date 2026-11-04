<script setup lang="ts">
import { X, Keyboard } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const shortcuts = [
  { key: 'Space', desc: 'تشغيل / إيقاف مؤقت (Play / Pause)' },
  { key: 'Ctrl + →', desc: 'الأغنية التالية (Next Track)' },
  { key: 'Ctrl + ←', desc: 'الأغنية السابقة (Previous Track)' },
  { key: 'M', desc: 'كتم / تشغيل الصوت (Mute / Unmute)' },
  { key: '?', desc: 'إظهار نافذة الاختصارات (Toggle Shortcuts)' },
  { key: 'Esc', desc: 'إغلاق النوافذ المنبثقة (Close Modal)' }
]
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Keyboard class="w-5 h-5" />
          </div>
          <div>
            <h2 id="shortcuts-title" class="text-base font-bold text-white">اختصارات لوحة المفاتيح</h2>
            <p class="text-xs text-slate-400">تحكم سريع وسلس في المشغل والمكتبة</p>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="إغلاق النافذة"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Shortcuts List -->
      <div class="space-y-2.5">
        <div
          v-for="sc in shortcuts"
          :key="sc.key"
          class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
        >
          <span class="text-slate-300 font-medium">{{ sc.desc }}</span>
          <kbd class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-orange-400 font-mono font-bold text-xs shadow-inner">
            {{ sc.key }}
          </kbd>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-2 text-center text-xs text-slate-400">
        اضغط <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Esc</kbd> أو انقر في أي مكان للإغلاق
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>
