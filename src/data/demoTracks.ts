import type { Track, Album, Artist, Playlist } from '@/types'

export const demoTracks: Track[] = [
  {
    id: 'demo-1',
    title: 'نور الصباح (Morning Light)',
    artist_name: 'أنغام الشرق (Oriental Melodies)',
    album_title: 'رحلة في الأندلس (Andalusian Journey)',
    duration_ms: 215000,
    storage_path: 'tracks/demo-1.mp3',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    is_favorite: true,
    download_status: 'downloaded',
    release_year: 2024
  },
  {
    id: 'demo-2',
    title: 'Desert Echoes',
    artist_name: 'Dune Soundscapes',
    album_title: 'Oasis Solitude',
    duration_ms: 184000,
    storage_path: 'tracks/demo-2.mp3',
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    is_favorite: false,
    download_status: 'not_downloaded',
    release_year: 2024
  },
  {
    id: 'demo-3',
    title: 'سكون الليل (Night Serenity)',
    artist_name: 'تريو القانون (Qanun Trio)',
    album_title: 'مقامات أصيلة (Authentic Maqam)',
    duration_ms: 272000,
    storage_path: 'tracks/demo-3.mp3',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    is_favorite: true,
    download_status: 'downloaded',
    release_year: 2023
  },
  {
    id: 'demo-4',
    title: 'Midnight Breeze',
    artist_name: 'Acoustic Waves',
    album_title: 'City Lights',
    duration_ms: 198000,
    storage_path: 'tracks/demo-4.mp3',
    cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    is_favorite: false,
    download_status: 'not_downloaded',
    release_year: 2024
  }
]

export const demoAlbums: Album[] = [
  {
    id: 'alb-1',
    title: 'رحلة في الأندلس (Andalusian Journey)',
    artist_name: 'أنغام الشرق',
    track_count: 8,
    release_year: 2024,
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'alb-2',
    title: 'Oasis Solitude',
    artist_name: 'Dune Soundscapes',
    track_count: 6,
    release_year: 2024,
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'alb-3',
    title: 'مقامات أصيلة (Authentic Maqam)',
    artist_name: 'تريو القانون',
    track_count: 10,
    release_year: 2023,
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
  }
]

export const demoArtists: Artist[] = [
  {
    id: 'art-1',
    name: 'أنغام الشرق (Oriental Melodies)',
    track_count: 14,
    album_count: 2
  },
  {
    id: 'art-2',
    name: 'Dune Soundscapes',
    track_count: 9,
    album_count: 1
  },
  {
    id: 'art-3',
    name: 'تريو القانون (Qanun Trio)',
    track_count: 12,
    album_count: 3
  }
]

export const demoPlaylists: Playlist[] = [
  {
    id: 'pl-1',
    title: 'جلسة هدوء واسترخاء (Deep Focus)',
    description: 'مختارات موسيقية هادئة للتركيز والقراءة',
    track_count: 18,
    cover_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pl-2',
    title: 'Morning Acoustic',
    description: 'Acoustic tracks to start a productive day',
    track_count: 12,
    cover_url: 'https://images.unsplash.com/photo-1445985543469-7233886ff323?auto=format&fit=crop&w=400&q=80'
  }
]
