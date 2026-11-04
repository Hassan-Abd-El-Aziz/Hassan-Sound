# MySound — Roadmap & Execution Checklist

وثيقة تتبع تقدم المشروع بالمراحل التفصيلية والمهام المنجزة ومعايير القبول (Acceptance Criteria).

---

## 🧭 الفلسفة العامة للتنفيذ
- تنفيذ مرحلة واحدة في كل مرة بدقة عالية واكتمال منطقي.
- عدم الانتقال من مرحلة إلى أخرى دون اجتياز البناء والاختبارات وموافقة المستخدم.
- الأمان أولاً: لا أسرار، Buckets خاصة، صلاحيات RLS صارمة.
- تجربة مستخدم حقيقية: عدم الاكتفاء بالرسومات الصامتة، وربط العناصر بمنطق حقيقي.

---

## 📌 مراحل المشروع

### Phase 0 — الاستكشاف والتخطيط (Discovery & Plan) `[مكتملة]`
- [x] فحص البيئة ونظام التشغيل والأدوات المتوفرة.
- [x] تهيئة مستودع Git والملفات الأساسية (`.gitignore`, `.env.example`).
- [x] إعداد `README.md` كمرجع حي للمتطلبات.
- [x] إنشاء سجل القرارات الهندسية `docs/DECISIONS.md`.
- [x] إعداد خارطة الطريق `docs/ROADMAP.md` وسجل التغييرات `CHANGELOG.md`.

### Phase 1 — الأساس المعماري وهيكل التطبيق (Foundation & Shell) `[المرحلة الحالية]`
- [x] إعداد Vite 6 + Vue 3 Composition API + TypeScript.
- [x] إعداد Tailwind CSS 4 للمظهر الداكن ولمسات البرتقالي الدافئ (`accent: #f97316`).
- [x] إعداد إدارة الحالة المركزية Pinia.
- [x] إعداد نظام التوجيه Vue Router 4 لجميع الصفحات الـ 14 المطلوبة:
  - `Login` (`/login`)
  - `Home` (`/`)
  - `Library / All Tracks` (`/library`)
  - `Artists` (`/artists`)
  - `Albums` (`/albums`)
  - `Playlists` (`/playlists`)
  - `Favorites` (`/favorites`)
  - `Recently Played` (`/recently-played`)
  - `Listening History` (`/history`)
  - `Downloads / Offline` (`/downloads`)
  - `Upload Manager` (`/upload`)
  - `Track Details` (`/track/:id`)
  - `Settings / Storage` (`/settings`)
  - `Not Found` (`/:pathMatch(.*)*`)
- [x] إعداد نظام التدويل (i18n) للغتين العربية والإنجليزية مع تطبيق فوري لـ `dir="rtl"` و `dir="ltr"` وحفظ التفضيل محليًا.
- [x] بناء هيكل التطبيق المتجاوب:
  - Desktop Sidebar (قابلة للطي والتنقل السهل)
  - Mobile TopBar & Mobile Bottom Navigation Bar
  - Persistent Mini-Player في أسفل الشاشة
  - شاشة Now Playing القابلة للتوسيع
  - حالات الواجهة: Empty / Loading / Error / Offline indicator
- [x] إعداد Vite PWA بمظهر التطبيق الكامل (Standalone Manifest, Theme Color, Icons).
- [x] إعداد أدوات الفحص والاختبارات (Vitest, Vue Test Utils, Type Check).

### Phase 2 — أساس Supabase والأمان (Supabase Foundation & Auth) `[مكتملة]`
- [x] تثبيت وإعداد حزمة `@supabase/supabase-js`.
- [x] كتابة ملفات الترحيل SQL migrations للجداول الـ 13 المحددة:
  - `profiles`, `artists`, `albums`, `genres`, `tracks`, `playlists`, `playlist_tracks`, `favorites`, `listening_history`, `playback_state`, `devices`, `device_downloads`, `user_settings`.
- [x] تفعيل سياسات الأمان RLS على جميع الجداول للمالك فقط (`auth.uid() = owner_id`).
- [x] إنشاء Storage Buckets الخاصة (`audio` و `covers`) وتوثيق سياسات القراءة والكتابة ومنع الوصول العام.
- [x] بناء خدمة التخزين الآمن وتوليد الروابط الموقعة (`getSignedAudioUrl` و `getSignedCoverUrl`).
- [x] حظر التسجيل العام وربط صفحة تسجيل الدخول بالمصادقة السحابية مع حارس التوجيه (Auth Guard).
- [x] إعداد دليل تفصيلي خطوة بخطوة في `supabase/README.md`.

### Phase 3 — إدارة الرفع والكتالوج (Upload Manager & Catalog) `[قادمة]`
- [ ] دعم رفع الملفات المتعددة مع السحب والإفلات (Drag & Drop).
- [ ] قراءة بيانات التعريف ID3 metadata واستخراج الأغلفة المضمنة في المتصفح.
- [ ] نافذة مراجعة وتعديل بيانات الأغاني قبل الرفع.
- [ ] حساب بصمة المحتوى (Hash) لمنع التكرار ورفع الملفات إلى Supabase Storage.
- [ ] شاشات استعراض المسارات والبحث والفرز والتصفية وتعديل البيانات.

### Phase 4 — مشغل الصوت والمشغل المستمر (Audio Engine & Player) `[قادمة]`
- [ ] Audio Engine مركزي (Singleton Service) متصل بـ Pinia.
- [ ] تشغيل سلس دون انقطاع عند التنقل بين مختلف الصفحات.
- [ ] تحكم كامل: Play/Pause, Seek, Volume, Shuffle, Repeat (Off/One/All).
- [ ] إدارة قائمة الانتظار Queue (إضافة، حذف، إعادة ترتيب، تفريغ).
- [ ] تكامل Media Session API لاختصارات لوحة المفاتيح والتحكم من شاشة القفل.
- [ ] استعادة موقع التشغيل الأخير تلقائيًا عند إعادة فتح التطبيق.

### Phase 5 — المجموعات والتفضيلات (Playlists & Collections) `[قادمة]`
- [ ] إنشاء وحذف وتعديل قوائم التشغيل وإعادة ترتيب مساراتها.
- [ ] المفضلة (Favorites) ووسم المسارات بضغطة زر.
- [ ] سجل الاستماع وحساب الإحصائيات (الأكثر تشغيلًا والأحدث).

### Phase 6 — التخزين والتشغيل بدون اتصال (Offline Architecture) `[قادمة]`
- [ ] تكامل IndexedDB (عبر Dexie.js) لتخزين المسارات كـ Blobs مع البيانات الوصفية.
- [ ] نظام تتبع حالات التنزيل لكل جهاز مستقل (`not_downloaded`, `queued`, `downloading`, `downloaded`, `failed`).
- [ ] دعم حذف التنزيل المحلي دون المساس بالملف السحابي.
- [ ] اختبار التشغيل الفعلي بعد قطع الاتصال بالإنترنت تمامًا.

### Phase 7 — المزامنة وحالة الأجهزة (Device Sync & Outbox) `[قادمة]`
- [ ] تسجيل معرّف الجهاز `device_id` محليًا وتتبع حالة كل جهاز.
- [ ] مزامنة موقع التشغيل (Playback State) وسياسة Last-Write-Wins.
- [ ] Outbox محلي للعمليات المنفذة في وضع عدم الاتصال مع معالجة إعادة المحاولة التلقائية.

### Phase 8 — التحسين والأداء والنسخ الاحتياطي (Polish & Backup) `[قادمة]`
- [ ] إمكانية الوصول (Accessibility) واختصارات لوحة المفاتيح.
- [ ] إدارة مساحة التخزين وعرض تفاصيل الاستهلاك المحلي.
- [ ] أداة تصدير واستيراد بيانات المكتبة الوصفية كملف JSON Manifest.

### Phase 9 — إطلاق الإنتاج (Production & Release) `[قادمة]`
- [ ] فحص أمني شامل والتأكد من خلو الحزم من أي مفاتيح حساسة.
- [ ] إعدادات استضافة الإنتاج ودعم HTTPS والتحديث الآمن للـ Service Worker.
