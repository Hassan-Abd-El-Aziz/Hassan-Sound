<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import MiniPlayer from '@/components/layout/MiniPlayer.vue'
import NowPlayingModal from '@/components/layout/NowPlayingModal.vue'
import ShortcutsModal from '@/components/common/ShortcutsModal.vue'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const player = usePlayerStore()
const showShortcuts = ref(false)

const isPublicRoute = computed(() => {
  return route.name === 'login'
})

// Desktop Keyboard Shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  // Ignore if user is typing in an input or textarea
  const target = e.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
    return
  }

  if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
    e.preventDefault()
    showShortcuts.value = !showShortcuts.value
  } else if (e.key === 'Escape' && showShortcuts.value) {
    e.preventDefault()
    showShortcuts.value = false
  } else if (e.code === 'Space') {
    e.preventDefault()
    player.togglePlay()
  } else if (e.code === 'ArrowRight' && e.ctrlKey) {
    e.preventDefault()
    player.nextTrack()
  } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
    e.preventDefault()
    player.prevTrack()
  } else if (e.code === 'KeyM') {
    e.preventDefault()
    player.toggleMute()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  player.restoreSavedState()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
    <!-- Login / Public Layout -->
    <template v-if="isPublicRoute">
      <router-view />
    </template>

    <!-- App Shell (Desktop Sidebar + Content + MiniPlayer + Mobile BottomNav) -->
    <template v-else>
      <div class="flex min-h-screen w-full">
        <!-- Desktop Sidebar -->
        <AppSidebar />

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-950">
          <AppHeader />

          <main class="flex-1 px-4 md:px-8 py-6 pb-36 md:pb-32 overflow-x-hidden">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>
      </div>

      <!-- Persistent Audio Player -->
      <MiniPlayer />

      <!-- Expanded Fullscreen Now Playing Drawer -->
      <NowPlayingModal />

      <!-- Mobile Bottom Navigation (fixed at bottom on mobile) -->
      <AppBottomNav />

      <!-- Keyboard Shortcuts Modal -->
      <ShortcutsModal :is-open="showShortcuts" @close="showShortcuts = false" />
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
