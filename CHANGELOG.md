# MySound — Changelog

كل التغييرات والإضافات والتحسينات المطبقة في المشروع موثقة هنا وفقًا لأسلوب [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

---

## [1.0.0] - 2026-11-04
### Added (Phase 9 - Production Release & Deployment)
- إجراء الفحص الأمني الشامل والتأكد من خلو ملفات الكود ومخرجات البناء من أي مفاتيح حساسة أو `service_role`.
- إنشاء ملفات التكوين للنشر بنقرة واحدة:
  - `vercel.json`: قواعد إعادة توجيه مسارات SPA وترويسات التخزين المؤقت والأمان على Vercel.
  - `netlify.toml`: إعدادات البناء وإعادة التوجيه لـ Netlify.
  - `public/_redirects` و `public/_headers`: دعم كامل لـ Cloudflare Pages.
- إضافة أيقونة أجهزة أبل `public/icons/apple-touch-icon.png` لضمان ظهور أيقونة PWA بدقة عند التثبيت على شاشة iPhone/iPad.
- إعداد توثيق ودليل النشر الشامل في `docs/DEPLOYMENT.md` بما في ذلك إعدادات خوادم Nginx وقوائم التحقق قبل الإطلاق.
- تفعيل ترويسات منع كاش ملف `sw.js` لضمان التحديث التلقائي الفوري لـ Service Worker مع كاش سنوي للأصول المجزأة (Hashed Assets).

## [0.8.0] - 2026-11-04
### Added (Phase 8 - Polish, Backup Manifest, iOS & Shortcuts)
- إنشاء خدمة النسخ الاحتياطي `src/services/backupService.ts` لتوليد واستيراد بيان المكتبة الرقمي (Library Manifest v1.0).
- إعداد وثيقة توثيق استراتيجية النسخ الاحتياطي الشاملة في `docs/BACKUP_AND_RESTORE.md`.
- إعداد وثيقة قيود ومعمارية WebKit و iOS في `docs/IOS_LIMITATIONS.md` وتغطية سياسات إخلاء التخزين بعد 7 أيام وتشغيل الصوت في الخلفية والتثبيت كـ PWA.
- بناء نافذة اختصارات لوحة المفاتيح `src/components/common/ShortcutsModal.vue` وربط اختصار `?` و `Esc` عالميًا في `App.vue`.
- تطوير شاشة الإعدادات `src/views/SettingsView.vue` بأزرار تصدير واستيراد ملف بيان المكتبة JSON واختصارات لوحة المفاتيح مع رسائل تأكيد فورية.
- إضافة 4 اختبارات وحدة للـ Backup Manifest ليصبح إجمالي الاختبارات الناجحة 44 اختباراً.

## [0.7.0] - 2026-11-04
### Added (Phase 7 - Device Sync, Playback State & Outbox)
- إنشاء خدمة تسجيل الأجهزة `src/services/deviceService.ts` لتوليد معرّف `device_id` فريد وحفظ تفاصيل المتصفح ونظام التشغيل.
- بناء خدمة المزامنة `src/services/syncService.ts` ومخزن Pinia `src/stores/sync.ts`.
- تطبيق سياسة Last-Write-Wins (LWW) لمنع استبدال موضع التشغيل السحابي الأحدث بتحديث أقدم من جهاز غير متصل.
- تطبيق نمط Outbox في IndexedDB لجدولة التعديلات غير المتصلة وإرسالها تراكميًا بصورة Idempotent فور عودة الاتصال.
- تطوير صفحة الإعدادات `SettingsView.vue` لعرض الأجهزة المرتبطة، وشارة حالة المزامنة (Synced / Pending / Offline) وزر المزامنة الفورية.
- إضافة اختبارات وحدة للمزامنة ومعالجة التضارب وصندوق الـ Outbox (إجمالي 40 اختبار وحدة ناجح).

## [0.6.0] - 2026-11-04
### Added (Phase 6 - Offline Architecture & Downloads)
- تثبيت وإعداد `dexie` لإنشاء قاعدة بيانات IndexedDB (`MySoundOfflineDB`) لتخزين المسارات والأغلفة كـ Blobs.
- بناء خدمة التنزيل `downloadService.ts` للتحقق من سلامة الملفات وبصمات SHA-256 قبل وسمها كـ Downloaded.
- إنشاء مخزن التنزيلات `src/stores/offline.ts` مع متابعة الحصص والمساحات المستخدمة ونسبة الاستهلاك.
- ربط `AudioEngine` بالتشغيل دون اتصال: تشغيل المسار تلقائياً كـ `Blob URL` عند توفره محلياً، وحظر محاولات البث السحابي في وضع عدم الاتصال للأغاني غير المنزلة مع تنبيه ملائم.
- تطوير صفحة التنزيلات `DownloadsView.vue` مع مراقبة استهلاك الذاكرة، وطلب تثبيت التخزين الدائم، وحذف الملفات محلياً فقط.
- إضافة اختبارات وحدة للتخزين في IndexedDB والتحقق وسحب الـ Blobs (إجمالي 36 اختبار وحدة ناجح).

## [0.5.0] - 2026-11-04
### Added (Phase 5 - Playlists & Collections)
- إنشاء خدمة المجموعات `src/services/collectionsService.ts` ومخزن Pinia `src/stores/collections.ts`.
- بناء واجهة قوائم التشغيل `PlaylistsView.vue` مع إنشاء وتعديل وحذف القوائم وعرض مساراتها وتشغيلها بالكامل.
- تطوير صفحة المفضلة `FavoritesView.vue` مع مزامنة فورية لحالة الإعجاب وتشغيل الكل.
- تطوير صفحة سجل الاستماع `HistoryView.vue` وصفحة المشغلة مؤخرًا `RecentlyPlayedView.vue`.
- تسجيل تاريخ وجلسات الاستماع الزمني تلقائيًا مع وقت وتاريخ الجلسة وحالة الاكتمال.
- إضافة اختبارات وحدة للمجموعات وسجل الاستماع والمفضلة (إجمالي 31 اختبار وحدة ناجح).

## [0.4.0] - 2026-11-04
### Added (Phase 4 - Audio Engine & Music Player)
- إنشاء محرك الصوت الموحد `src/services/audioEngine.ts` (Singleton Audio Engine).
- تفعيل آلية تجديد الروابط الموقعة (Signed URLs Renewal) عند انتهاء صلاحيتها أثناء البث واستئناف الموضع تلقائياً.
- التكامل مع Media Session API للتحكم في التشغيل من شاشة القفل والإشعارات وأزرار سماعات الرأس.
- حفظ واستعادة موضع التشغيل والمسار الحالي دورياً وعند مغادرة أو إعادة فتح التطبيق.
- نغمة صوتية متناسقة عبر Web Audio API للعمل في وضع العرض وبدون ملفات سحابية.
- تحسين المشغل المصغر `MiniPlayer.vue` وشاشة `NowPlayingModal.vue` بدعم مؤشرات التحميل وإعادة ترتيب عناصر قائمة الانتظار.
- إضافة اختبارات وحدة لمحرك الصوت والمشغل (ليصل المجموع إلى 27 اختبار وحدة ناجح).

## [0.3.0] - 2026-11-04
### Added (Phase 3 - Upload Manager & Catalog)
- تثبيت وإعداد `music-metadata-browser` واستخراج وسوم ID3 والمدة ومعدل البت والأغلفة المضمنة كـ Blob.
- إنشاء خدمة `src/services/cryptoHash.ts` لحساب بصمة SHA-256 لمنع تكرار الملفات.
- إنشاء خدمة الكتالوج `src/services/catalogService.ts` ومخزن `src/stores/catalog.ts` مع دعم التصفح والبحث والترتيب وإعادة استخدام الفنان والألبوم.
- تطوير صفحة إدارة الرفع `src/views/UploadView.vue`:
  - دعم اختيار ملفات متعددة ومجلد كامل وسحب وإفلات.
  - قائمة انتظار الرفع مع شريط تقدم حقيقي وإمكانية إعادة المحاولة وحذف العناصر.
  - تعديل البيانات الوصفية المباشر.
- تطوير صفحة المكتبة `src/views/LibraryView.vue` مع نوافذ تعديل وحذف الأغنية والترقيم (Pagination).
- إضافة 8 اختبارات وحدة جديدة (ليصل المجموع إلى 24 اختبار وحدة ناجح).

## [0.2.0] - 2026-11-04
### Added (Phase 2 - Supabase Foundation & Auth)
- إضافة حزمة `@supabase/supabase-js`.
- كتابة ملفات الترحيل SQL migrations الأربعة:
  - `20261104000001_create_schema.sql`: الجداول الـ 13 والفهارس والقيود.
  - `20261104000002_enable_rls.sql`: تفعيل سياسات Row Level Security للمالك فقط.
  - `20261104000003_storage_buckets.sql`: إنشاء Buckets الخاصة `audio` و `covers`.
  - `20261104000004_triggers_and_functions.sql`: مشغلات التحديث والملفات الشخصية التلقائية.
- إنشاء خدمة التخزين `src/services/supabase.ts` مع دوال الروابط الموقعة `getSignedAudioUrl` و `getSignedCoverUrl`.
- ربط `src/stores/auth.ts` بمصادقة Supabase الرسمية وتتبع الجلسات والتجديد التلقائي.
- إضافة حارس التوجيه (Auth Guard) في `src/router/index.ts` لحماية المسارات وإعادة التوجيه للـ Login.
- كتابة دليل إعداد المشروع وخطوات التهيئة في `supabase/README.md`.
- إضافة اختبارات الوحدة للعميل والخدمة ومخزن المصادقة (16 اختبار ناجح).

## [0.1.0] - 2026-11-04
### Added (Phase 0 & Phase 1)
- **Phase 0:**
  - استكشاف البيئة وتهيئة مستودع Git الأساسي.
  - إعداد `README.md` كوثيقة متطلبات حية ثنائية اللغة.
  - إعداد `docs/ROADMAP.md` و`docs/DECISIONS.md`.
  - إعداد `.gitignore` و`.env.example` لضمان عدم تسريب أي أسرار.
- **Phase 1 (Foundation):**
  - تهيئة مشروع Vue 3 مع TypeScript وVite 6 وTailwind CSS 4.
  - إعداد Pinia لإدارة الحالة ونظام التوجيه Vue Router 4 لجميع الصفحات الـ 14.
  - تطبيق نظام التدويل i18n باللغتين العربية والإنجليزية مع دعم RTL/LTR وحفظ التفضيل.
  - بناء هيكل واجهة المستخدم المتجاوب (Responsive Shell):
    - Desktop Sidebar.
    - Mobile TopBar & Bottom Navigation.
    - Mini Player ثابت في الأسفل.
    - شاشة Now Playing القابلة للتوسيع.
    - حالات Empty / Loading / Error / Offline indicator.
  - إعداد مكتبة أيقونات Lucide Icons وخطوط Cairo وInter.
  - إعداد وتفعيل Vite PWA وتكوين الـ manifest.
  - إعداد اختبارات Vitest وVue Test Utils وتدقيق الأنواع عبر TypeScript.
