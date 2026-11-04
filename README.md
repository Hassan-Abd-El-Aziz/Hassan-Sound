# MySound 🎵

> **تطبيق سحابي وشخصي لتشغيل وحفظ الموسيقى (Private Cloud & Offline Music PWA)**
> تطبيق ويب تقدمي خاص مصمم لمالك واحد حصريًا، يعمل بسلاسة على أجهزة الكمبيوتر والهواتف الذكية مع دعم البث السحابي والتشغيل بدون اتصال (Offline Playback).

---

## 📖 نظرة عامة | Overview

**MySound** هو مشغل ومكتبة صوتية خاصة تم بناؤها لتمنحك السيطرة الكاملة على موسيقاك ومكتبتك الصوتية الخاصة (أقل من 500 تراك في البداية مع قابلية التوسع)، دون الحاجة للاشتراك في خدمات تجارية ودون أي خصائص اجتماعية أو رفع جماعي.

- **المالك الوحيد (Single-Owner):** لا يوجد تسجيل عام (Public Sign Up). الحساب يتم إعداده مسبقًا فقط لمالك المكتبة.
- **ثنائي اللغة مع RTL حقيقي:** واجهة عربية أصيلة وإنجليزية مع دعم كامل لاتجاه النص وتنسيق العناصر (`dir="rtl"` و `dir="ltr"`).
- **التشغيل السحابي والمحلي (Online Streaming & Offline):** استماع مباشر عبر روابط مؤمنة قصيرة الصلاحية (Signed URLs)، مع إمكانية تنزيل الأغاني وحفظها محليًا عبر IndexedDB على كل جهاز بشكل مستقل.
- **PWA متكامل:** تثبيت فوري كتطبيق أصيل على اللابتوب (Chrome/Edge)، أندرويد، وآيفون (iOS Safari).

---

## 🛠 حزمة التقنيات | Tech Stack

| المجال | التقنية | التوضيح |
| :--- | :--- | :--- |
| **Framework** | Vue 3 (Composition API + `<script setup>`) | سرعة وخفة وأداء فائق |
| **Build Tool** | Vite 6 + TypeScript | بناء فائق السرعة وتطوير آمن مع تدقيق الأنواع |
| **Styling** | Tailwind CSS 4 | تخصيص دقيق مع مظهر داكن أنيق (Dark Mode) ولمسات برتقالية |
| **State Management** | Pinia | إدارة مركزية لحالة المشغل، التنزيلات، والبيانات |
| **Routing** | Vue Router 4 | نظام ملاحة متجاوب يدعم جميع صفحات التطبيق |
| **Backend & Auth** | Supabase (PostgreSQL + RLS + Storage) | قاعدة بيانات سحابية وتخزين خاص ومصادقة مشفرة |
| **PWA & Offline** | Vite PWA (Workbox) + IndexedDB | App Shell caching وتخزين ملفات الصوت كـ Blobs محليًا |
| **Audio Engine** | HTMLAudioElement + Web Audio API | مشغل صوت موثوق مع معالجة أحداث الشبكة وMedia Session |
| **Icons & Fonts** | Lucide Icons + Cairo / Inter | واجهة تفاعلية واضحة ومريحة للعين |
| **Testing** | Vitest + @vue/test-utils | اختبارات وحدة للخدمات والـ Stores والمكونات |

---

## 🔒 مبادئ الأمان والخصوصية | Security & Privacy Rules

1. **لا أسرار في المتصفح:** لا يتم استخدام `service_role_key` أبدًا في الكود الأمامي أو Git.
2. **Buckets خاصة 100%:** ملفات الصوت (`audio`) والأغلفة (`covers`) غير متاحة للعامة، ويتم الوصول إليها عبر Signed URLs ذات صلاحية محددة يتم تجديدها تلقائيًا.
3. **RLS محكم:** جميع الجداول في PostgreSQL محمية بسياسات Row Level Security تقتصر على `auth.uid() = owner_id`.
4. **منع التسجيل المفتوح:** تسجيل الدخول مقصور على المالك المسجل مسبقًا.

---

## 🚀 التشغيل والتطوير المحلي | Getting Started

### المتطلبات المسبقة:
- Node.js >= 20.x
- npm >= 10.x

### 1. تثبيت الحزم:
```bash
npm install
```

### 2. إعداد المتغيرات البيئية:
انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```
املأ بيانات مشروع Supabase الخاص بك:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. تشغيل وضع التطوير:
```bash
npm run dev
```

### 4. الفحص والاختبار:
```bash
npm run build       # بناء نسخة الإنتاج
npm run test        # تشغيل اختبارات Vitest
npm run type-check  # التحقق من صحة الأنواع في TypeScript
```

---

## 📁 هيكلية المشروع | Project Structure

```text
mysound/
├── docs/
│   ├── ROADMAP.md          # خارطة الطريق والمراحل التفصيلية
│   ├── DECISIONS.md        # سجل القرارات الهندسية والمعمارية (ADR)
├── src/
│   ├── assets/             # ملفات التنسيق والخطوط والأيقونات
│   ├── components/         # مكونات واجهة المستخدم القابلة لإعادة الاستخدام
│   │   ├── common/         # أزرار، حقول إدخال، نوافذ منبثقة، حالات فارغة
│   │   ├── layout/         # الشريط الجانبي، القائمة السفلية، المشغل المصغر
│   │   └── player/         # شاشة المشغل الموسيقي وقائمة الانتظار
│   ├── composables/        # دوال قابلة لإعادة الاستخدام (Audio, Storage, Network)
│   ├── i18n/               # نصوص الترجمة العربية والإنجليزية
│   ├── router/             # تعريف مسارات التطبيق الـ 14 وحراس التوجيه
│   ├── stores/             # Pinia stores (Player, Library, Offline, Auth)
│   ├── types/              # تعريفات الأنواع في TypeScript
│   ├── views/              # صفحات التطبيق (Home, Library, Settings, etc.)
│   ├── App.vue             # المكون الجذري
│   └── main.ts             # نقطة انطلاق التطبيق
├── supabase/
│   └── migrations/         # ملفات ترحيل قاعدة البيانات وسياسات RLS
├── tests/                  # اختبارات الوحدة والتكامل
├── .env.example            # نموذج متغيرات البيئة
├── package.json            # الحزم والتبعيات
└── vite.config.ts          # إعدادات Vite وPWA وTailwind
```

---

## 📋 خطة المراحل | Roadmap Status

- [x] **Phase 0: الاستكشاف والتخطيط (Discovery & Plan)**
- [x] **Phase 1: الأساس المعماري والواجهة (Foundation & Shell)**
- [ ] **Phase 2: قاعدة بيانات Supabase والأمان (Supabase Foundation & Auth)**
- [ ] **Phase 3: إدارة الرفع والكتالوج (Upload Manager & Catalog)**
- [ ] **Phase 4: محرك الصوت والمشغل المستمر (Audio Engine & Player)**
- [ ] **Phase 5: القوائم والمجموعات (Playlists & Collections)**
- [ ] **Phase 6: التشغيل دون اتصال (Offline Storage & IndexedDB)**
- [ ] **Phase 7: المزامنة السحابية والحالة (Device Sync & Outbox)**
- [ ] **Phase 8: التحسين والأداء والنسخ الاحتياطي (Polish & Backup)**
- [ ] **Phase 9: الإطلاق والإنتاج (Production & Release)**
