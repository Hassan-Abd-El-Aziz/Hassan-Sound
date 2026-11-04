export const messages = {
  ar: {
    app: {
      name: 'MySound',
      tagline: 'مكتبتك الموسيقية السحابية الخاصة',
      privateBadge: 'خاص بمالك المكتبة',
      online: 'متصل بالإنترنت',
      offline: 'وضع عدم الاتصال'
    },
    nav: {
      home: 'الرئيسية',
      library: 'المكتبة / الأغاني',
      artists: 'الفنانون',
      albums: 'الألبومات',
      playlists: 'قوائم التشغيل',
      favorites: 'المفضلة',
      recentlyPlayed: 'تم تشغيلها مؤخراً',
      history: 'سجل الاستماع',
      downloads: 'التنزيلات المحلية',
      upload: 'إدارة الرفع',
      settings: 'الإعدادات والتخزين',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج'
    },
    player: {
      nowPlaying: 'قيد التشغيل الآن',
      queue: 'قائمة الانتظار',
      emptyQueue: 'لا توجد أغانٍ في قائمة الانتظار',
      play: 'تشغيل',
      pause: 'إيقاف مؤقت',
      next: 'التالي',
      previous: 'السابق',
      shuffle: 'تشغيل عشوائي',
      repeat: 'تكرار',
      repeatOff: 'إيقاف التكرار',
      repeatAll: 'تكرار الكل',
      repeatOne: 'تكرار الأغنية الحالية',
      volume: 'مستوى الصوت',
      mute: 'كتم الصوت',
      unmute: 'إلغاء الكتم',
      favorite: 'إضافة للمفضلة',
      unfavorite: 'إزالة من المفضلة',
      download: 'تنزيل للجهاز',
      downloaded: 'منزلة محلياً',
      downloading: 'جاري التنزيل...',
      unknownTitle: 'أغنية غير محددة',
      unknownArtist: 'فنان غير معروف',
      unknownAlbum: 'ألبوم غير معروف',
      trackInfo: 'تفاصيل الأغنية'
    },
    common: {
      loading: 'جاري التحميل...',
      emptyTitle: 'لا توجد عناصر لعرضها',
      emptyDescription: 'ابدأ برفع أغانيك المفضلة لتظهر هنا.',
      searchPlaceholder: 'ابحث عن أغنية، فنان، ألبوم...',
      retry: 'إعادة المحاولة',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      close: 'إغلاق',
      back: 'رجوع',
      errorTitle: 'حدث خطأ غير متوقع',
      errorDescription: 'تعذر إكمال العملية، يرجى التحقق من اتصالك والمحاولة مجدداً.',
      demoMode: 'وضع العرض التوضيحي (Phase 1)',
      tracksCount: '{count} أغنية',
      durationMinutes: '{minutes} دقيقة',
      all: 'الكل'
    },
    views: {
      home: {
        welcome: 'مرحباً بك في MySound',
        subtitle: 'استمتع بمجموعتك الصوتية الشخصية أينما كنت',
        quickActions: 'إجراءات سريعة',
        recentlyAdded: 'أُضيفت حديثاً',
        jumpBackIn: 'تابع الاستماع'
      },
      library: {
        title: 'مكتبة الأغاني',
        subtitle: 'جميع المسارات الصوتية المخزنة في مكتبتك الخاصة',
        sortBy: 'ترتيب حسب',
        filterBy: 'تصفية'
      },
      artists: {
        title: 'الفنانون',
        subtitle: 'تصفح الموسيقى بحسب الفنانين'
      },
      albums: {
        title: 'الألبومات',
        subtitle: 'المجموعات والألبومات الكاملة'
      },
      playlists: {
        title: 'قوائم التشغيل',
        subtitle: 'قوائمك الشخصية المخصصة',
        newPlaylist: 'قائمة جديدة'
      },
      favorites: {
        title: 'الأغاني المفضلة',
        subtitle: 'المسارات التي نالت إعجابك'
      },
      recentlyPlayed: {
        title: 'تم تشغيلها مؤخراً',
        subtitle: 'آخر الأغاني التي استمعت إليها على هذا الجهاز'
      },
      history: {
        title: 'سجل الاستماع الكامل',
        subtitle: 'تاريخ استماعك الزمني وتكرار التشغيل'
      },
      downloads: {
        title: 'التنزيلات والتشغيل بدون إنترنت',
        subtitle: 'الأغاني المخزنة محلياً في ذاكرة هذا الجهاز',
        storageUsed: 'المساحة المستخدمة محلياً',
        clearAll: 'حذف التنزيلات من هذا الجهاز',
        onlyOnThisDevice: 'الملفات المنزلة تخص هذا الجهاز فقط'
      },
      upload: {
        title: 'إدارة الرفع السحابي',
        subtitle: 'ارفع ملفاتك الصوتية إلى مساحتك الخاصة في Supabase',
        dropzoneText: 'اسحب وأفلت الملفات الصوتية هنا، أو انقر للاختيار',
        supportedFormats: 'الصيغ المدعومة: MP3, M4A, FLAC, WAV',
        queueTitle: 'قائمة الرفع'
      },
      settings: {
        title: 'الإعدادات والتخزين',
        subtitle: 'تخصيص التطبيق وإدارة الأجهزة والتخزين المحلي',
        language: 'لغة الواجهة',
        theme: 'المظهر',
        darkTheme: 'داكن (افتراضي)',
        storageManagement: 'إدارة التخزين المحلي',
        connectedDevices: 'الأجهزة المسجلة',
        securityNote: 'تطبيقك مؤمن بالكامل عبر Supabase RLS'
      },
      notFound: {
        title: 'الصفحة غير موجودة (404)',
        description: 'الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.',
        backHome: 'العودة للرئيسية'
      }
    }
  },
  en: {
    app: {
      name: 'MySound',
      tagline: 'Your Private Cloud Music Library',
      privateBadge: 'Owner Exclusive',
      online: 'Online',
      offline: 'Offline Mode'
    },
    nav: {
      home: 'Home',
      library: 'Library / Tracks',
      artists: 'Artists',
      albums: 'Albums',
      playlists: 'Playlists',
      favorites: 'Favorites',
      recentlyPlayed: 'Recently Played',
      history: 'Listening History',
      downloads: 'Local Downloads',
      upload: 'Upload Manager',
      settings: 'Settings & Storage',
      login: 'Sign In',
      logout: 'Sign Out'
    },
    player: {
      nowPlaying: 'Now Playing',
      queue: 'Play Queue',
      emptyQueue: 'Your queue is empty',
      play: 'Play',
      pause: 'Pause',
      next: 'Next',
      previous: 'Previous',
      shuffle: 'Shuffle',
      repeat: 'Repeat',
      repeatOff: 'Repeat Off',
      repeatAll: 'Repeat All',
      repeatOne: 'Repeat Track',
      volume: 'Volume',
      mute: 'Mute',
      unmute: 'Unmute',
      favorite: 'Add to Favorites',
      unfavorite: 'Remove from Favorites',
      download: 'Download to Device',
      downloaded: 'Downloaded Locally',
      downloading: 'Downloading...',
      unknownTitle: 'Unknown Track',
      unknownArtist: 'Unknown Artist',
      unknownAlbum: 'Unknown Album',
      trackInfo: 'Track Info'
    },
    common: {
      loading: 'Loading...',
      emptyTitle: 'No items to display',
      emptyDescription: 'Start uploading your favorite tracks to see them here.',
      searchPlaceholder: 'Search tracks, artists, albums...',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      close: 'Close',
      back: 'Back',
      errorTitle: 'An error occurred',
      errorDescription: 'Unable to complete the action. Please check your connection and retry.',
      demoMode: 'Demo Mode (Phase 1)',
      tracksCount: '{count} tracks',
      durationMinutes: '{minutes} mins',
      all: 'All'
    },
    views: {
      home: {
        welcome: 'Welcome to MySound',
        subtitle: 'Enjoy your personal music collection anywhere, anytime',
        quickActions: 'Quick Actions',
        recentlyAdded: 'Recently Added',
        jumpBackIn: 'Jump Back In'
      },
      library: {
        title: 'All Tracks',
        subtitle: 'All audio tracks stored in your private library',
        sortBy: 'Sort by',
        filterBy: 'Filter'
      },
      artists: {
        title: 'Artists',
        subtitle: 'Browse your music by artist'
      },
      albums: {
        title: 'Albums',
        subtitle: 'Complete collections and records'
      },
      playlists: {
        title: 'Playlists',
        subtitle: 'Your curated sound collections',
        newPlaylist: 'New Playlist'
      },
      favorites: {
        title: 'Favorites',
        subtitle: 'Tracks you loved'
      },
      recentlyPlayed: {
        title: 'Recently Played',
        subtitle: 'Tracks you recently listened to on this device'
      },
      history: {
        title: 'Listening History',
        subtitle: 'Chronological playback history and statistics'
      },
      downloads: {
        title: 'Local Downloads & Offline',
        subtitle: 'Music stored in this browser memory for offline playback',
        storageUsed: 'Local Storage Used',
        clearAll: 'Clear Downloads on this Device',
        onlyOnThisDevice: 'Downloads are isolated to this device only'
      },
      upload: {
        title: 'Upload Manager',
        subtitle: 'Upload audio files to your private Supabase storage',
        dropzoneText: 'Drag & drop audio files here, or click to browse',
        supportedFormats: 'Supported: MP3, M4A, FLAC, WAV',
        queueTitle: 'Upload Queue'
      },
      settings: {
        title: 'Settings & Storage',
        subtitle: 'App preferences, device management, and storage details',
        language: 'Interface Language',
        theme: 'Theme',
        darkTheme: 'Dark (Default)',
        storageManagement: 'Storage Management',
        connectedDevices: 'Registered Devices',
        securityNote: 'Fully secured with Supabase Row Level Security (RLS)'
      },
      notFound: {
        title: 'Page Not Found (404)',
        description: 'The requested page could not be found.',
        backHome: 'Back to Home'
      }
    }
  }
}
