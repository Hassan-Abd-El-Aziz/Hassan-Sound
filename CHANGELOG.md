# MySound — Changelog

كل التغييرات والإضافات والتحسينات المطبقة في المشروع موثقة هنا وفقًا لأسلوب [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

---

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
