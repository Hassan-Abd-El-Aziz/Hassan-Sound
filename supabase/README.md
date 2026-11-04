# إعداد قاعدة بيانات وتخزين Supabase (MySound)

دليل تفصيلي خطوة بخطوة لتهيئة مشروع Supabase الخاص بك، وتطبيق الـ Migrations، وإنشاء حساب المالك، وربطه بالتطبيق بأمان تام.

---

## 1. إنشاء مشروع Supabase جديد
1. ادخل إلى لوحة تحكم [Supabase Dashboard](https://supabase.com/dashboard).
2. انقر على **"New project"**.
3. اختر اسمًا للمشروع (مثل `mysound-app`)، وحدد كلمة مرور قوية لقاعدة البيانات، واختر أقرب منطقة جغرافية (Region).
4. انتظر دقيقة حتى يكتمل تجهيز المشروع.

---

## 2. تنفيذ ملفات الـ SQL Migrations
في لوحة تحكم المشروع، انتقل إلى **SQL Editor**، ثم نفّذ الملفات التالية بالترتيب:

1. **`supabase/migrations/20261104000001_create_schema.sql`**:
   - ينشئ الجداول الـ 13 المطلوبة والفهارس وعلاقات المفاتيح الأجنبية.
2. **`supabase/migrations/20261104000002_enable_rls.sql`**:
   - يفعّل سياسات Row Level Security الصارمة لمنع أي وصول غير مصرح به إلا للمالك (`auth.uid() = owner_id`).
3. **`supabase/migrations/20261104000003_storage_buckets.sql`**:
   - ينشئ الـ Buckets الخاصة (`audio` و `covers`) ويضبط سياسات التخزين.
4. **`supabase/migrations/20261104000004_triggers_and_functions.sql`**:
   - ينشئ مشغلات التحديث التلقائي وتوليد الملف الشخصي فور إضافة المستخدم.

---

## 3. إنشاء حساب المالك (Single Owner Setup)
بما أن التطبيق خاص ومغلق ولا يسمح بالتسجيل المفتوح (Public Sign Up):
1. انتقل إلى **Authentication** -> **Users**.
2. انقر على **"Add user"** -> **"Create user"**.
3. أدخل البريد الإلكتروني الخاص بك وكلمة مرور قوية (مثل: `owner@mysound.com`).
4. فعّل خيار **"Auto Confirm User?"** حتى لا يتطلب تفعيل عبر البريد.
5. انقر على **"Create user"**.
6. في **Authentication** -> **Providers** -> **Email**: قم بإلغاء تفعيل **"Allow new users to sign up"** لضمان عدم تمكن أي شخص خارجي من إنشاء حساب جديد.

---

## 4. استخراج مفاتيح الربط وضبط ملف `.env`
1. في لوحة تحكم Supabase، اذهب إلى **Project Settings** -> **API**.
2. انسخ القيمتين التاليتين:
   - **Project URL**: ضعه في `VITE_SUPABASE_URL`
   - **Project API Keys** -> `anon` / `public`: ضعه في `VITE_SUPABASE_ANON_KEY`
3. في مجلد المشروع محليًا، أنشئ ملف `.env` (مستنسخًا من `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh......
   ```

> [!CAUTION]
> **تحذير أمني صارم:**
> لا تقم أبدًا بنسخ مفتاح `service_role` (Secret) أو وضعه في ملف `.env` الخاص بالواجهة الأمامية أو في Git. مفتاح `anon` هو المفتاح المصرح به للواجهة الأمامية وهو محمي بسياسات RLS التي قمنا بتطبيقها.
