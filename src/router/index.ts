import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'nav.home' }
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
    meta: { title: 'nav.library' }
  },
  {
    path: '/artists',
    name: 'artists',
    component: () => import('@/views/ArtistsView.vue'),
    meta: { title: 'nav.artists' }
  },
  {
    path: '/albums',
    name: 'albums',
    component: () => import('@/views/AlbumsView.vue'),
    meta: { title: 'nav.albums' }
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: () => import('@/views/PlaylistsView.vue'),
    meta: { title: 'nav.playlists' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: 'nav.favorites' }
  },
  {
    path: '/recently-played',
    name: 'recently-played',
    component: () => import('@/views/RecentlyPlayedView.vue'),
    meta: { title: 'nav.recentlyPlayed' }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'nav.history' }
  },
  {
    path: '/downloads',
    name: 'downloads',
    component: () => import('@/views/DownloadsView.vue'),
    meta: { title: 'nav.downloads' }
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/UploadView.vue'),
    meta: { title: 'nav.upload' }
  },
  {
    path: '/track/:id',
    name: 'track-details',
    component: () => import('@/views/TrackDetailsView.vue'),
    meta: { title: 'player.trackInfo' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'nav.settings' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'nav.login', public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'views.notFound.title', public: true }
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
