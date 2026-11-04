# Antigravity Execution Prompt --- MySound

أنت مهندس برمجيات Senior Full-Stack ومهندس حلول متخصص في Vue 3 وPWA
وSupabase وتطبيقات الصوت. مطلوب منك بناء **MySound**: تطبيق ويب شخصي خاص
لتخزين وتشغيل مكتبة الموسيقى الخاصة بمالك واحد فقط، على اللابتوب
والموبايل، مع Streaming سحابي وOffline playback للأغاني التي تم تنزيلها
محليًا.

## 1. المرجع الملزم

ابدأ بقراءة `README.md` بالكامل. اعتبره وثيقة المتطلبات الأساسية. إذا
وجدت تعارضًا بينه وبين افتراض تقني، لا تتجاهل المتطلبات؛ اختر الحل الأكثر
أمانًا ودوّن القرار في `docs/DECISIONS.md`.

الاختيارات المحسومة: - Cloud storage: Supabase. - Library size: أقل من
500 أغنية مبدئيًا. - Private: مالك واحد فقط، لا يوجد تسجيل عام. -
Arabic + English مع RTL/LTR. - Web App / PWA على اللابتوب وAndroid
وiPhone. - Online streaming وOffline للأغاني المنزلة على كل جهاز. - لا
يوجد رفع من مستخدمين آخرين ولا خصائص اجتماعية.

لا تنسخ SoundCloud حرفيًا ولا تستخدم شعاره أو أصوله أو اسمه التجاري.
استلهم فقط أنماط تجربة المستخدم العامة، وأنشئ هوية أصلية باسم MySound.

## 2. قواعد العمل الإلزامية

1.  افحص الملفات الحالية وبيئة التشغيل قبل أي تعديل.
2.  أنشئ `README.md` أولًا أو حدّثه ليطابق المتطلبات.
3.  أنشئ `docs/ROADMAP.md` و`docs/DECISIONS.md` و`CHANGELOG.md`.
4.  نفّذ مرحلة واحدة في كل مرة، ولا تنتقل قبل نجاح اختبارات المرحلة.
5.  لا تنشئ واجهات شكلية بأزرار غير موصولة بمنطق حقيقي.
6.  لا تستخدم mock data في مسارات الإنتاج. يمكن استخدام بيانات Demo في
    وضع تطوير واضح ومنفصل.
7.  لا تضع Supabase `service_role` أو أي secret في Frontend أو Git.
8.  استخدم `.env.example` بقيم placeholders فقط، وأضف `.env` إلى
    `.gitignore`.
9.  لا تجعل Storage bucket عامًا. استخدم RLS وStorage policies وsigned
    URLs قصيرة الصلاحية.
10. لا تدّعِ أن ميزة تعمل Offline قبل اختبارها بعد فصل الإنترنت فعليًا.
11. عند وجود نقص في credentials، أكمل ما يمكن محليًا، واكتب بوضوح ما
    يحتاج إعدادًا يدويًا. لا تخترع مفاتيح.
12. استخدم TypeScript حيثما أمكن، مع كود منظم ومكونات صغيرة قابلة لإعادة
    الاستخدام.
13. حافظ على دعم الشاشات الصغيرة والكبيرة وإمكانية الوصول.
14. بعد كل مرحلة قدّم تقريرًا: ما تم، الملفات المهمة، أوامر التشغيل،
    الاختبارات، ما تبقى، وأي قرارات.
15. لا تتوقف عند رسم الواجهة؛ المطلوب منتج قابل للاستخدام بمنطق داخلي
    حقيقي.

## 3. Stack المطلوب

-   Vue 3 Composition API + `<script setup>`.
-   Vite + TypeScript.
-   Tailwind CSS 4.
-   Vue Router.
-   Pinia.
-   Supabase JS SDK: Auth + PostgreSQL + Storage.
-   PWA عبر Vite PWA/Workbox بإصدارات متوافقة ومستقرة.
-   HTMLAudioElement للمشغل الأساسي.
-   Web Audio API للخصائص الصوتية المتقدمة لاحقًا.
-   IndexedDB عبر مكتبة صغيرة موثوقة مثل Dexie، أو تنفيذ واضح ومختبر.
-   OPFS اختياري لتخزين الملفات إذا كان دعم المتصفح مناسبًا؛ لا تفترض
    دعمه بالتساوي.
-   مكتبة metadata موثوقة لاستخراج ID3 وEmbedded Artwork، مع التحقق من
    توافقها مع المتصفح.
-   Waveform يمكن توليده من بيانات الصوت أو مكتبة مناسبة؛ لا تجعل توليده
    شرطًا يمنع تشغيل الأغنية.
-   Lucide icons.

لا تضف مكتبات كثيرة بلا داعٍ. وثّق سبب كل dependency رئيسية.

## 4. التصميم وتجربة الاستخدام

أنشئ واجهة حديثة أصلية: - Dark mode افتراضي. - Accent برتقالي دافئ، مع
ألوان محايدة. - Cairo أو Rubik للعربية وInter للإنجليزية. - Desktop
sidebar. - Mobile bottom navigation. - Mini player ثابت في أسفل
الشاشة. - Now Playing screen. - أغلفة ألبومات واضحة. - حالات Empty /
Loading / Error / Offline. - RTL حقيقي للعناصر والأيقونات واتجاهات
الحركة. - تبديل اللغة من Settings مع حفظ الاختيار. - Responsive من شاشة
هاتف صغيرة إلى Desktop. - Keyboard shortcuts على Desktop. - Focus
indicators وARIA labels وأحجام لمس مناسبة.

الصفحات: 1. Login. 2. Home. 3. Library / All Tracks. 4. Artists. 5.
Albums. 6. Playlists. 7. Favorites. 8. Recently Played. 9. Listening
History. 10. Downloads / Offline. 11. Upload Manager. 12. Track Details.
13. Settings / Storage. 14. Not Found.

## 5. نموذج البيانات

أنشئ SQL migrations داخل مجلد واضح مثل `supabase/migrations/`. استخدم
UUID وFK وindexes وtimestamps وقيود uniqueness عند الحاجة.

الجداول: - profiles - artists - albums - tracks - genres - track_genres
(إذا احتجتها) - playlists - playlist_tracks - favorites -
listening_history - playback_state - devices - device_downloads -
user_settings

متطلبات `tracks`: - id, owner_id, title, artist_id, album_id, genre_id -
track_number, release_year, duration_ms - mime_type, file_extension,
file_size_bytes - bitrate, sample_rate - storage_path,
cover_storage_path - content_hash - created_at, updated_at

قواعد: - خزّن Storage path فقط، ولا تخزّن signed URL دائمًا. - اجعل
`owner_id` مرتبطًا بمالك الحساب. - لا تكرر الفنان أو الألبوم إذا كان من
الممكن إعادة استخدام سجل موجود بشكل صحيح. - تعامل مع metadata الناقصة
دون فشل الرفع. - لا تستخدم اسم الملف وحده لمنع التكرار. - أضف pagination
عند جلب المكتبة حتى لو كان العدد المتوقع صغيرًا.

## 6. Supabase Security

-   أنشئ bucket خاصًا للملفات الصوتية وآخر للأغلفة، أو هيكلًا آمنًا موثقًا.
-   فعّل RLS على كل الجداول.
-   اكتب policies تمنع القراءة والكتابة إلا للمالك المصرح به.
-   امنع Sign Up العام من واجهة التطبيق.
-   لا تعرض أي بيانات أو ملفات دون جلسة مصادق عليها.
-   استخدم signed URLs عند تشغيل الملفات الخاصة، بمدة صلاحية مناسبة.
-   تعامل مع انتهاء صلاحية الرابط أثناء التشغيل: جدّد الرابط ثم استأنف
    التشغيل إن أمكن.
-   لا تضع service role key في المتصفح.
-   أضف تعليمات إنشاء حساب المالك يدويًا من لوحة Supabase.
-   اختبر أن جلسة مستخدم آخر لا تستطيع قراءة أو تعديل أي ملف أو سجل.
-   لا تعتبر إخفاء زر التسجيل حماية؛ الحماية الحقيقية في Auth وRLS
    وStorage policies.

## 7. Upload Manager

نفّذ رفعًا متعدد الملفات: - File picker. - Drag & Drop. - Folder picker
عند دعم المتصفح. - Queue لكل ملف. - Progress حقيقي. - Cancel / Retry. -
رسائل خطأ واضحة. - تحقق من MIME والامتداد والحجم. - قراءة metadata
وembedded artwork. - نموذج مراجعة metadata قبل الحفظ أو بعده. - تعديل
title/artist/album/genre/year/track number. - كشف التكرار عبر hash عند
الإمكان. - لا تفقد حالة الواجهة عند فشل ملف واحد. - استخدم
resumable/multipart upload إذا كان مناسبًا ومدعومًا في الحل المختار، ولا
تدّعِ استكمال الرفع إن لم يتم تنفيذه. - اكتب اختبارات للملفات ذات metadata
الناقصة والصيغ غير المدعومة.

ابدأ بدعم MP3 وM4A/AAC وWAV وFLAC، واختبر التشغيل الفعلي. أضف OGG وOPUS
فقط بعد التحقق. تعامل مع اختلاف codec بين Safari وChrome وAndroid.

## 8. Music Player

أنشئ Audio Player مركزيًا singleton عبر service/store composable، بحيث لا
يتوقف عند الانتقال بين الصفحات.

الوظائف: - Play/Pause. - Previous/Next. - Seek. - Volume. - Shuffle. -
Repeat Off/One/All. - Queue add/remove/reorder/clear. - Favorite. - Mini
Player. - Full Now Playing. - مدة الأغنية والوقت الحالي. - حفظ playback
position دوريًا وعند pause/page visibility/unload بآلية مناسبة. - استعادة
الأغنية والموضع بعد إعادة فتح التطبيق. - التعامل مع أخطاء التحميل
وانقطاع الاتصال وانتهاء signed URL. - منع تشغيل نسخ متعددة من Audio
element. - دعم Media Session API عند توفره. - دعم اختصارات لوحة المفاتيح
مع عدم تعطيل الكتابة داخل inputs. - لا تفترض إمكانية autoplay؛ تعامل مع
قيود المتصفح واطلب تفاعل المستخدم عند الحاجة.

## 9. Offline Architecture

نفّذ Offline على أنه مستويان منفصلان:

### App Shell

-   Service Worker يخزن ملفات الواجهة الثابتة.
-   التطبيق يفتح بعد زيارة Online أولى.
-   اعرض حالة Online/Offline.
-   استراتيجية تحديث آمنة للـ service worker دون مسح تنزيلات المستخدم.

### Downloaded Music

-   خزّن ملفات الصوت التي اختار المستخدم تنزيلها داخل IndexedDB Blob أو
    OPFS.
-   خزّن metadata والفهارس في IndexedDB.
-   لكل جهاز سجل تنزيل مستقل.
-   حالات التنزيل: not_downloaded / queued / downloading / downloaded /
    failed.
-   تحقق من اكتمال الملف وحجمه، واستخدم hash إذا توفر.
-   لا تضع علامة Downloaded قبل التحقق.
-   دعم إلغاء التنزيل وإعادة المحاولة.
-   Pause/Resume إن أمكن؛ لا تعرض زرًا غير فعّال.
-   إدارة المساحة وحجم كل تنزيل.
-   زر إزالة التنزيل المحلي لا يحذف الملف السحابي.
-   زر Clear Downloads يخص الجهاز الحالي فقط ويطلب تأكيدًا.
-   اطلب persistent storage إن كان مدعومًا واعرض النتيجة.
-   اشرح أن المتصفح قد يفرض إخلاء التخزين وأنه لا يوجد ضمان مطلق
    للاحتفاظ.
-   لا تشغّل من السحابة عند Offline إذا لم توجد نسخة محلية.
-   لا تجعل تنزيل الأغنية على جهاز يعني تنزيلها على الأجهزة الأخرى.

### Offline test

1.  افتح التطبيق Online.
2.  نزّل أغنية.
3.  افصل الإنترنت تمامًا.
4.  أغلق التطبيق وافتحه مجددًا.
5.  تحقق من فتح التطبيق وتشغيل الأغنية.
6.  اختبر أغنية غير منزلة وتأكد من رسالة مناسبة.
7.  أعد الاتصال واختبر sync.
8.  اختبر انقطاع الشبكة في منتصف تنزيل ملف.

## 10. Sync

-   Supabase هو مصدر البيانات المركزي عند الاتصال.
-   مزامنة metadata وplaylists وfavorites وhistory.
-   لا تزامن ملفات الصوت تلقائيًا.
-   `device_downloads` يعبر عن حالة كل جهاز فقط.
-   سجل `device_id` محليًا بصورة آمنة ومميزة.
-   playback state يتضمن track_id وposition_ms وupdated_at وdevice_id.
-   ضع سياسة واضحة: آخر تحديث صالح يفوز، مع تجنب overwrite من تحديث
    قديم.
-   استخدم Outbox محلي لتغييرات Offline القابلة للمزامنة.
-   عند عودة الاتصال، نفّذ retry مع backoff ومعالجة idempotent.
-   اعرض Synced / Pending / Failed.
-   تجنب إنشاء history events مكررة عند إعادة المحاولة.

## 11. Playlists & Library

-   إنشاء وتعديل وحذف Playlist.
-   إضافة/إزالة وإعادة ترتيب الأغاني.
-   Favorites.
-   Search بالعنوان والفنان والألبوم.
-   Sorting: title, artist, album, date added, duration.
-   Filters: genre, artist, album, downloaded.
-   Recently Added.
-   Recently Played.
-   Most Played.
-   Empty states واضحة.
-   حذف track يجب أن يوضح أثر الحذف على playlists والتاريخ والتنزيلات
    المحلية. لا تحذف الملف السحابي قبل التأكد من صلاحية العملية وتأكيد
    المالك.

## 12. Settings & Backup

Settings: - اللغة. - Theme. - جودة العرض إن لزم. - إدارة التنزيلات
والمساحة. - الأجهزة المرتبطة. - تسجيل الخروج. - معلومات التطبيق.

Backup: - وثّق نسخ قاعدة البيانات وملفات Storage. - لا تعتبر تصدير
metadata وحده نسخة احتياطية كاملة. - أنشئ آلية تصدير واستيراد metadata
مع manifest يربط الملفات بمساراتها وhashes. - وضح أن ملفات الموسيقى
تحتاج نسخة احتياطية منفصلة أو استعادة من Storage. - اختبر restore على
بيئة منفصلة قبل اعتبار النسخ الاحتياطي مكتملًا.

## 13. الاختبارات

أضف: - Unit tests للـ stores والخدمات الأساسية. - Integration tests للـ
upload وdatabase access عند الإمكان. - E2E لأهم المسارات. - اختبار
سياسات الأمان. - اختبار Offline على متصفحات وأجهزة فعلية. - اختبار
responsive وRTL/LTR. - اختبار الملفات الفارغة والتالفة وغير المدعومة
والملفات الكبيرة. - اختبار انقطاع الشبكة وانتهاء signed URL.

Browser targets: - Chrome وEdge على Windows. - Safari على iPhone. -
Chrome على Android.

وثّق القيود الخاصة بـ iOS، خصوصًا التخزين والخلفية وMedia Session، ولا تعد
المستخدم بسلوك لا يضمنه المتصفح.

## 14. مراحل التنفيذ المطلوبة

### Phase 0 --- Discovery & Plan

افحص البيئة، أنشئ README وroadmap وdecisions وchecklist. لا تبدأ ميزات
كبيرة قبل خطة واضحة.

### Phase 1 --- Foundation

Vue/Vite/TS/Tailwind، routing، Pinia، i18n، design system، responsive
shell، PWA shell، lint/test setup.

Acceptance: - التطبيق يعمل محليًا. - العربية والإنجليزية تعملان. -
RTL/LTR صحيح. - التنقل يعمل. - لا توجد أخطاء console أساسية.

### Phase 2 --- Supabase Foundation

Auth، migrations، RLS، private buckets، environment setup.

Acceptance: - المالك يستطيع الدخول. - التسجيل العام غير متاح. - مستخدم
غير مصرح لا يستطيع الوصول إلى بيانات المالك. - لا توجد أسرار في bundle.

### Phase 3 --- Upload & Catalog

رفع ملفات، metadata، covers، catalog، search، edit/delete.

Acceptance: - رفع عدة ملفات. - progress/error/retry. - البيانات تظهر بعد
refresh ومن جهاز آخر. - الملفات لا يمكن الوصول إليها دون صلاحية.

### Phase 4 --- Player

Audio engine، queue، controls، persistent player، media session.

Acceptance: - التشغيل لا يتوقف عند التنقل. - كل أزرار المشغل تعمل. -
الأخطاء والروابط المنتهية تُعالج.

### Phase 5 --- Collections

Playlists، favorites، history، recently played.

Acceptance: - التعديلات تحفظ وتظهر على جهاز آخر.

### Phase 6 --- Offline

Service worker، IndexedDB/OPFS، downloads، offline library.

Acceptance: - تشغيل ملف منزّل بعد فصل الإنترنت وإعادة فتح التطبيق. - عدم
الادعاء بأن غير المنزّل متاح Offline. - حذف المحلي لا يحذف السحابي.

### Phase 7 --- Sync

Device registration، playback state، outbox، conflict handling.

Acceptance: - بيانات المكتبة تتزامن. - التنزيلات مستقلة لكل جهاز. -
تحديث قديم لا يستبدل تحديثًا أحدث.

### Phase 8 --- Polish

Accessibility، performance، storage manager، backup/restore،
documentation.

### Phase 9 --- Release

Production build، deployment، HTTPS، security review، smoke tests،
release notes.

## 15. المطلوب منك الآن

ابدأ فورًا بـ Phase 0 ثم Phase 1 فقط. لا تنفذ كل المشروع في رد واحد أو
دفعة واحدة.

قبل التنفيذ: - افحص الملفات والمجلدات الموجودة. - إذا كان المشروع فارغًا،
أنشئ الهيكل المناسب. - إذا كان هناك مشروع قائم، حافظ على الكود السليم
ولا تستبدله عشوائيًا. - حدّث README.md ليكون مرجعًا حيًا.

بعد إكمال Phase 1: 1. شغّل build وlint وtests. 2. أصلح الأخطاء بدل
إخفائها. 3. اعرض شجرة الملفات الرئيسية. 4. اشرح طريقة التشغيل محليًا. 5.
اذكر ما تم اختباره فعليًا. 6. اذكر بوضوح ما لم يتم تنفيذه بعد. 7. توقف
وانتظر موافقة المستخدم قبل Phase 2.

ابدأ الآن. الجودة والاكتمال والأمان أهم من سرعة توليد عدد كبير من
الملفات.
