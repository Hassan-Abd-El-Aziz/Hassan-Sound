# دليل نشر وإطلاق تطبيق MySound للإنتاج (Production Deployment Guide)

دليل هندسي شامل لنشر تطبيق **MySound** كـ Progressive Web App (PWA) فائق الأداء والأمان على منصات الاستضافة السحابية المختلفة (Vercel, Netlify, Cloudflare Pages, VPS / Nginx / Docker).

---

## 1. المتطلبات السحابية الأساسية قبل النشر

قبل إطلاق التطبيق للمالك، تأكد من إتمام الآتي في لوحة تحكم [Supabase](https://supabase.com):
1. **قاعدة البيانات:** تشغيل كافة الـ Migrations الأربعة الموجودة في `supabase/migrations/`.
2. **Buckets التخزين:** التأكد من وجود مجلدي `audio` و `covers` كـ **مجلدات خاصة بالكامل** (`public: false`).
3. **سياسات الأمان (RLS):** تفعيل RLS على كافة الجداول الـ 13 و Buckets التخزين.
4. **حساب المالك:** إنشاء حساب المالك يدوياً من قسم `Authentication > Users > Add User` مع كلمة مرور قوية وتأكيد البريد الإلكتروني.
5. **إلغاء التسجيل العام:** التأكد من إيقاف `Allow new users to sign up` في `Authentication > Providers > Email` لمنع أي مستخدم خارجي من التسجيل.

---

## 2. متغيرات البيئة للإنتاج (Environment Variables)

يحتاج تطبيق Frontend إلى متغيرين اثنين فقط (الموجودين في `.env.example`):

| المتغير | الوصف | مثال |
|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | مفتاح الواجهة الأمامية العام المحدود بـ RLS | `eyJhbGciOiJIUzI1Ni...` |

> [!CAUTION]
> **تحذير أمني صارم:**
> لا تضع مفتاح `service_role` (Secret Key) أبدًا في متغيرات بيئة الـ Frontend أو في أي خدمة استضافة عمومية. مفتاح `anon` هو المفتاح المصرح به فقط.

---

## 3. خيارات النشر السحابي

### الخيار الأول: النشر على Vercel (موصى به)
تم تضمين ملف الإعدادات [`vercel.json`](file:///C:/Users/Hassan%20abdelaziz/Downloads/mysound/vercel.json) المهيأ مع توجيه SPA وترويسات الأمان.
1. اربط مستودع Git بـ Vercel.
2. اختر الإطار: **Vite**.
3. أضف متغيري البيئة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`.
4. اضغط **Deploy**.

---

### الخيار الثاني: النشر على Netlify
تم تضمين ملف الإعدادات [`netlify.toml`](file:///C:/Users/Hassan%20abdelaziz/Downloads/mysound/netlify.toml).
1. اربط المستودع في لوحة تحكم Netlify.
2. أمر البناء: `npm run build`.
3. مجلد النشر (Publish Directory): `dist`.
4. أضف متغيرات البيئة في `Site configuration > Environment variables`.
5. اضغط **Deploy Site**.

---

### الخيار الثالث: النشر على Cloudflare Pages
تم تضمين ملفي `public/_redirects` و `public/_headers` اللذين يُنسخان تلقائيًا إلى مجلد `dist/`.
1. في Cloudflare Dashboard > Pages > Create a project.
2. اختر المستودع، ثم حدد:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. أضف متغيرات البيئة واضغط **Save and Deploy**.

---

### الخيار الرابع: الاستضافة الذاتية (Nginx / Docker / VPS)
عند نشر التطبيق على سيرفر خاص Nginx، استخدم التهيئة التالية لضمان دعم SPA وعدم تخزين Service Worker مؤقتًا:

```nginx
server {
    listen 443 ssl http2;
    server_name mysound.yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/mysound.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mysound.yourdomain.com/privkey.pem;

    root /var/www/mysound/dist;
    index index.html;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), payment=()" always;

    # Service Worker and Manifest: NEVER cache
    location ~* (sw\.js|manifest\.webmanifest)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Hashed static assets: cache 1 year
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA routing: fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 4. شروط عمل الـ PWA وتشغيل الصوت (PWA & Audio Engine Checklist)

1. **إلزامية HTTPS:**
   - تقنيات الـ PWA (`ServiceWorker`, `Web Crypto API`, `IndexedDB Storage Persistence`, `MediaSession API`) لا تعمل عبر المتصفحات إلا عبر بروتوكول آمن `https://` (باستثناء `localhost` أثناء التطوير).
2. **تحديث الـ Service Worker التلقائي:**
   - تم ضبط `registerType: 'autoUpdate'` في VitePWA مع ترويسات `no-cache` لملف `sw.js` لضمان استلام التحديثات فور نشر أي إصدار جديد دون الحاجة لمسح بيانات المتصفح يدويًا.
3. **تثبيت PWA على iOS و Android:**
   - على هواتف iPhone/iPad: من متصفح Safari، اضغط على زر المشاركة ثم **Add to Home Screen**.
   - على هواتف Android: يظهر زر التثبيت تلقائيًا في شريط العنوان أو خيارات المتصفح.

---

## 5. قائمة التحقق النهائية قبل الإطلاق (Pre-launch Checklist)

- [x] عدم وجود أي مفاتيح `service_role` في الكود المصدري أو ملفات البناء.
- [x] إدراج `.env` و `.env.production` في ملف `.gitignore`.
- [x] بناء حزم الإنتاج بنجاح وخلوها من الأخطاء (`npm run build`).
- [x] اجتياز جميع اختبارات الوحدة الـ 44 بنجاح (`npm run test`).
- [x] خلو الكود من أي خطأ في فحص الأنواع (`npm run type-check`).
- [x] التحقق من تواجد أيقونات التطبيق وملف `apple-touch-icon.png`.
- [x] وجود قواعد إعادة التوجيه للـ SPA وترويسات الأمان.
- [x] استراتيجية النسخ الاحتياطي موثقة في `docs/BACKUP_AND_RESTORE.md`.
- [x] قيود بيئة iOS موثقة في `docs/IOS_LIMITATIONS.md`.
