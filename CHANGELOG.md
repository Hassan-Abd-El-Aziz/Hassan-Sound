# MySound — Changelog

كل التغييرات والإضافات والتحسينات المطبقة في المشروع موثقة هنا وفقًا لأسلوب [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

---

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
