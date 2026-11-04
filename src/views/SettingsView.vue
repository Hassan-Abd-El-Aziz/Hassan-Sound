<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Languages,
  Moon,
  HardDrive,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  LogOut,
  Info,
  RefreshCw,
  CheckCircle2,
  Clock,
  WifiOff
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'

const { t, locale, setLocale } = useI18n()
const auth = useAuthStore()
const sync = useSyncStore()
const router = useRouter()

onMounted(async () => {
  await sync.init()
})

const isSupabaseConfigured = computed(() => {
  return !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-ref.supabase.co'
})

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-4xl mx-auto select-none">
    <!-- Header -->
    <div class="pb-4 border-b border-slate-800/60">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('views.settings.title') }}</h1>
      <p class="text-sm text-slate-400 mt-1">{{ t('views.settings.subtitle') }}</p>
    </div>

    <!-- Section 1: Preferences -->
    <section class="space-y-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
        تفضيلات التطبيق (Preferences)
      </h3>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 space-y-4">
        <!-- Language Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Languages class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-semibold text-white">{{ t('views.settings.language') }}</h4>
              <p class="text-xs text-slate-400">اختر لغة الواجهة المفضلة مع ضبط اتجاه النص تلقائياً</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="setLocale('ar')"
              :class="[
                'px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95',
                locale === 'ar'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              ]"
            >
              العربية (RTL)
            </button>
            <button
              @click="setLocale('en')"
              :class="[
                'px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95',
                locale === 'en'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              ]"
            >
              English (LTR)
            </button>
          </div>
        </div>

        <!-- Theme Info -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <Moon class="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 class="text-sm font-semibold text-white">{{ t('views.settings.theme') }}</h4>
              <p class="text-xs text-slate-400">الوضع الداكن المريح للعين هو الخيار الأساسي للتطبيق</p>
            </div>
          </div>
          <span class="text-xs font-semibold text-orange-400 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Dark Mode (Default)
          </span>
        </div>
      </div>
    </section>

    <!-- Section 2: Sync & Connected Devices -->
    <section class="space-y-4">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          المزامنة والأجهزة المسجلة (Sync & Devices)
        </h3>

        <!-- Sync Outbox Status Badge -->
        <div class="flex items-center gap-2">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
              sync.syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : '',
              sync.syncStatus === 'syncing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : '',
              sync.syncStatus === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : '',
              sync.syncStatus === 'offline' ? 'bg-slate-800 text-slate-400 border border-slate-700' : ''
            ]"
          >
            <CheckCircle2 v-if="sync.syncStatus === 'synced'" class="w-3.5 h-3.5" />
            <RefreshCw v-else-if="sync.syncStatus === 'syncing'" class="w-3.5 h-3.5 animate-spin" />
            <Clock v-else-if="sync.syncStatus === 'pending'" class="w-3.5 h-3.5" />
            <WifiOff v-else class="w-3.5 h-3.5" />

            <span v-if="sync.syncStatus === 'synced'">متزامن (Synced)</span>
            <span v-else-if="sync.syncStatus === 'syncing'">جاري المزامنة...</span>
            <span v-else-if="sync.syncStatus === 'pending'">معلق ({{ sync.pendingOutboxCount }})</span>
            <span v-else>غير متصل</span>
          </span>

          <button
            @click="sync.flushOutbox"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            title="مزامنة فورية"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': sync.syncStatus === 'syncing' }" />
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 space-y-4">
        <!-- Current Device Identity -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Laptop class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold text-white">هذا الجهاز</h4>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">Current</span>
              </div>
              <p class="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs">{{ sync.deviceId }}</p>
            </div>
          </div>
          <span class="text-xs text-slate-300 font-mono">{{ sync.currentDevice?.device_name }}</span>
        </div>

        <!-- Registered Devices List -->
        <div class="space-y-2">
          <div class="text-[11px] font-semibold uppercase text-slate-400">الأجهزة المرتبطة بحسابك</div>
          <div class="divide-y divide-slate-800/40">
            <div
              v-for="dev in sync.registeredDevices"
              :key="dev.id"
              class="flex items-center justify-between py-2.5 text-xs text-slate-300"
            >
              <div class="flex items-center gap-2.5">
                <Smartphone v-if="dev.device_type === 'mobile'" class="w-4 h-4 text-slate-400" />
                <Tablet v-else-if="dev.device_type === 'tablet'" class="w-4 h-4 text-slate-400" />
                <Laptop v-else class="w-4 h-4 text-slate-400" />
                <div>
                  <span class="font-semibold text-white">{{ dev.device_name }}</span>
                  <span class="text-[11px] text-slate-400 ms-2">({{ dev.browser }} على {{ dev.os }})</span>
                </div>
              </div>
              <span class="text-[11px] text-slate-400 font-mono">نشط مؤخراً</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Storage Management Link -->
    <section class="space-y-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
        التخزين المحلي
      </h3>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <HardDrive class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-white">{{ t('views.settings.storageManagement') }}</h4>
            <p class="text-xs text-slate-400">تخزين ملفات الصوت Blobs في IndexedDB وحماية الذاكرة</p>
          </div>
        </div>
        <router-link
          to="/downloads"
          class="text-xs text-orange-400 hover:text-orange-300 font-semibold"
        >
          إدارة المساحة والتنزيلات →
        </router-link>
      </div>
    </section>

    <!-- Section 4: Supabase Security Status -->
    <section class="space-y-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
        حالة الأمان السحابي (Cloud Security)
      </h3>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 space-y-4">
        <div class="flex items-start gap-3 text-xs text-slate-300">
          <ShieldCheck class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <h4 class="font-semibold text-white">نظام التخزين الخاص المشفر بالكامل</h4>
            <p class="text-slate-400 leading-relaxed">
              {{ t('views.settings.securityNote') }}. الحساب مقصور على المالك ولا توجد أي مفاتيح حساسة في الـ Bundle.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
          <span class="text-slate-400">اتصال Supabase</span>
          <span
            :class="[
              'px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5',
              isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
            ]"
          >
            <span class="w-2 h-2 rounded-full" :class="isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'"></span>
            <span>{{ isSupabaseConfigured ? 'Configured' : 'Local Demo Mode' }}</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Logout / Account -->
    <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <Info class="w-4 h-4 text-orange-400" />
        <span>MySound PWA v0.1.0 • Single Owner Private Edition</span>
      </div>

      <button
        @click="handleLogout"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 text-xs font-semibold transition active:scale-95 cursor-pointer"
      >
        <LogOut class="w-4 h-4" />
        <span>{{ t('nav.logout') }}</span>
      </button>
    </div>
  </div>
</template>
