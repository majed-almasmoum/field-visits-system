# نظام تقارير الزيارات الميدانية

نسخة مجانية جاهزة للرفع على GitHub والنشر على Vercel.

## ماذا يحتوي؟
- تسجيل دخول بالبريد الإلكتروني عبر Supabase Auth
- نموذج إدخال زيارة ميدانية
- تقارير يومية وتقارير حسب الفترة
- رسوم بيانية للحالات والمشاعر
- تحميل البيانات بصيغة Excel
- حماية للبيانات بحيث كل مستخدم يرى سجلاته فقط

## التقنيات
- Next.js App Router
- Supabase Auth + Database
- Recharts
- XLSX
- Vercel

## 1) إنشاء مشروع Supabase
1. افتح Supabase وأنشئ مشروعًا جديدًا.
2. من SQL Editor نفّذ الملف `supabase/schema.sql`.
3. من Authentication > URL Configuration أضف:
   - Site URL: رابط الموقع بعد النشر على Vercel
   - Redirect URL: `https://YOUR_DOMAIN/auth/callback`
4. من Project Settings > API انسخ:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) إعداد المشروع محليًا
```bash
npm install
cp .env.example .env.local
npm run dev
```

ثم ضع قيم Supabase داخل `.env.local`.

## 3) الرفع إلى GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 4) النشر على Vercel
1. اربط المستودع مع Vercel.
2. أضف متغيرات البيئة نفسها داخل إعدادات المشروع على Vercel.
3. انشر المشروع.
4. ارجع إلى Supabase وحدّث Site URL و Redirect URL بالرابط النهائي.

## ملاحظات مهمة
- هذه النسخة تحفظ بيانات كل مستخدم بشكل منفصل بواسطة سياسات RLS.
- لو أردت لاحقًا لوحة مدير عامة لجميع المراقبين، أضف دور Admin وسياسة إضافية.
- لو أردت شعارك الحقيقي، استبدل مكوّن الشعار في `components/header.tsx` بصورة من مجلد `public/`.

## الملفات المهمة
- `app/page.tsx` : صفحة إدخال الزيارة
- `app/reports/page.tsx` : صفحة التقارير
- `components/visit-form.tsx` : نموذج الإدخال
- `components/reports-client.tsx` : منطق التقارير والتصدير
- `supabase/schema.sql` : إنشاء الجدول والسياسات
