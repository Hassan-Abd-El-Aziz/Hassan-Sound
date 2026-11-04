<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ShieldCheck, Lock, Mail, Radio, AlertCircle, Languages, Database } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const { t, locale, toggleLocale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('owner@mysound.local')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const success = await auth.login(email.value, password.value)
    if (success) {
      const redirectPath = (route.query.redirect as string) || '/'
      router.push(redirectPath)
    } else {
      errorMessage.value = auth.authError || 'بيانات الدخول غير صحيحة أو الحساب غير مصرح له'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'فشل تسجيل الدخول'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black select-none">
    <!-- Language Toggle Top Right/Left -->
    <div class="fixed top-6 end-6 z-10">
      <button
        @click="toggleLocale"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
      >
        <Languages class="w-3.5 h-3.5 text-orange-400" />
        <span>{{ locale === 'ar' ? 'English' : 'العربية' }}</span>
      </button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
      <!-- Brand & Icon -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-orange-500/30 ring-4 ring-orange-500/20">
          <Radio class="w-8 h-8" />
        </div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight pt-2">MySound</h1>
        <p class="text-xs text-slate-400">{{ t('app.tagline') }}</p>

        <!-- Private Owner Notice -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold mt-2">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>{{ t('app.privateBadge') }}</span>
        </div>
      </div>

      <!-- Supabase Connection Indicator -->
      <div
        :class="[
          'p-3 rounded-xl border text-xs flex items-center justify-between',
          auth.isConfigured
            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <Database class="w-4 h-4 shrink-0" />
          <span>
            {{ auth.isConfigured ? 'متصل بقاعدة Supabase الخاصة' : 'وضع العرض المحلي (يرجى إعداد .env)' }}
          </span>
        </div>
        <span class="w-2 h-2 rounded-full" :class="auth.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'"></span>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">البريد الإلكتروني لمالك الحساب</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute start-3 top-3 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              required
              class="w-full h-10 ps-10 pe-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="owner@mysound.com"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">كلمة المرور السرية</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute start-3 top-3 pointer-events-none" />
            <input
              v-model="password"
              type="password"
              required
              class="w-full h-10 ps-10 pe-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full h-11 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
        >
          <span v-if="isSubmitting">{{ t('common.loading') }}</span>
          <span v-else>{{ t('nav.login') }}</span>
        </button>
      </form>

      <!-- Security Notice Footer -->
      <div class="pt-4 border-t border-slate-800/60 text-center">
        <p class="text-[11px] text-slate-400 leading-relaxed">
          هذا التطبيق خاص ومغلق لمالك واحد فقط. لا يُسمح بالتسجيل العام للمستخدمين وفقًا لسياسات الأمان وقواعد RLS في Supabase.
        </p>
      </div>
    </div>
  </div>
</template>
