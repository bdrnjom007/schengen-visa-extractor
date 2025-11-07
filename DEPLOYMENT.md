# دليل النشر على Render

## الخطوات المطلوبة

### 1. إنشاء حساب على Render
- اذهب إلى https://render.com
- سجّل حساب جديد (يمكنك استخدام GitHub)

### 2. ربط المستودع
- من لوحة التحكم، اضغط على "New +"
- اختر "Web Service"
- اربط حساب GitHub الخاص بك
- اختر مستودع `schengen-visa-extractor`

### 3. إعداد قاعدة البيانات
- من لوحة التحكم، اضغط على "New +"
- اختر "PostgreSQL"
- اسم قاعدة البيانات: `schengen-visa-db`
- اختر الخطة المجانية (Free)
- اضغط "Create Database"

### 4. إعداد Web Service
بعد اختيار المستودع، قم بتعبئة الحقول التالية:

**Name**: `schengen-visa-api`

**Runtime**: `Node`

**Build Command**:
```
cd server && npm install && npm run build
```

**Start Command**:
```
cd server && npm start
```

**Environment Variables** (متغيرات البيئة):
```
NODE_ENV=production
DATABASE_URL=[سيتم ملؤه تلقائياً من قاعدة البيانات]
OPENAI_API_KEY=AIzaSyCIbOkfKF_ZQ84TLBQL8Sgprk_F1FPHces
PORT=3000
```

### 5. ربط قاعدة البيانات بالـ Web Service
- في صفحة Web Service، اذهب إلى "Environment"
- أضف متغير جديد:
  - Key: `DATABASE_URL`
  - Value: انسخ "Internal Database URL" من صفحة قاعدة البيانات

### 6. نشر المشروع
- اضغط "Create Web Service"
- انتظر حتى ينتهي البناء والنشر (قد يستغرق 5-10 دقائق)

### 7. تشغيل Migrations
بعد نجاح النشر، قم بتشغيل migrations لإنشاء الجداول:

من لوحة التحكم في Web Service:
- اذهب إلى "Shell"
- نفّذ الأمر:
```bash
cd server && npm run db:push
```

## متغيرات البيئة الإضافية (اختيارية)

إذا كنت تريد استخدام تخزين S3 للصور:

```
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1
```

## التحقق من النشر

بعد اكتمال النشر، ستحصل على رابط مثل:
```
https://schengen-visa-api.onrender.com
```

يمكنك التحقق من عمل الخادم بزيارة:
```
https://schengen-visa-api.onrender.com/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T..."
}
```

## ملاحظات مهمة

1. **الخطة المجانية** على Render:
   - تتوقف الخدمة بعد 15 دقيقة من عدم النشاط
   - تستيقظ تلقائياً عند أول طلب (قد يستغرق 30 ثانية)
   - 750 ساعة مجانية شهرياً

2. **قاعدة البيانات المجانية**:
   - تُحذف بعد 90 يوم من عدم النشاط
   - حجم محدود (512 MB)

3. **Frontend**:
   - يمكن نشر Frontend على Vercel أو Netlify مجاناً
   - أو دمجه مع Backend في نفس الخدمة

## استكشاف الأخطاء

إذا واجهت مشاكل:
1. تحقق من Logs في لوحة التحكم
2. تأكد من صحة متغيرات البيئة
3. تأكد من تشغيل migrations
4. تحقق من اتصال قاعدة البيانات
