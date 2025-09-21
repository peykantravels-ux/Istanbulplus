# مستندات سیستم احراز هویت Istanbul Plus

## نمای کلی

این پوشه شامل مستندات کامل سیستم احراز هویت پیشرفته Istanbul Plus می‌باشد که شامل API documentation، راهنماهای کاربری، و منابع توسعه‌دهندگان است.

## ساختار مستندات

```
docs/
├── README.md                           # این فایل
├── API_DOCUMENTATION.md                # مستندات کامل API
├── API_DOCUMENTATION_INDEX.md          # فهرست و راهنمای سریع API
├── USER_GUIDE.md                       # راهنمای کاربری
├── MIGRATION_GUIDE.md                  # راهنمای مهاجرت
├── SECURITY_DEPLOYMENT_CHECKLIST.md    # چک‌لیست امنیتی
├── api_documentation.py                # تنظیمات OpenAPI/Swagger
└── Istanbul_Plus_API.postman_collection.json  # مجموعه Postman
```

## شروع سریع

### 1. مشاهده مستندات تعاملی

```bash
# راه‌اندازی سرور
python manage.py runserver

# مراجعه به مستندات
# Swagger UI: http://localhost:8000/api/docs/
# ReDoc: http://localhost:8000/api/redoc/
```

### 2. تست API با Postman

1. فایل `Istanbul_Plus_API.postman_collection.json` را در Postman import کنید
2. متغیر `base_url` را تنظیم کنید
3. از collection برای تست استفاده کنید

### 3. مطالعه راهنماها

- **کاربران عادی**: `USER_GUIDE.md`
- **توسعه‌دهندگان**: `API_DOCUMENTATION.md`
- **مدیران سیستم**: `SECURITY_DEPLOYMENT_CHECKLIST.md`

## مستندات موجود

### 📚 راهنماهای کاربری

#### USER_GUIDE.md

راهنمای جامع برای کاربران نهایی شامل:

- نحوه ثبت‌نام و ورود
- استفاده از احراز هویت دو مرحله‌ای
- مدیریت پروفایل و تنظیمات
- عیب‌یابی مشکلات رایج

### 🔧 راهنماهای فنی

#### API_DOCUMENTATION.md

مستندات کامل API شامل:

- تمام endpoints با جزئیات
- Request/Response schemas
- Error handling
- Rate limiting
- Authentication flows

#### MIGRATION_GUIDE.md

راهنمای مهاجرت برای به‌روزرسانی سیستم:

- مراحل مهاجرت گام به گام
- اسکریپت‌های مهاجرت
- عیب‌یابی مشکلات
- Rollback procedures

### 🔒 راهنماهای امنیتی

#### SECURITY_DEPLOYMENT_CHECKLIST.md

چک‌لیست جامع امنیتی برای deployment:

- تنظیمات امنیتی Django
- تنظیمات سرور و شبکه
- مانیتورینگ و logging
- بهترین شیوه‌های امنیتی

### 🛠 ابزارهای توسعه

#### api_documentation.py

تنظیمات OpenAPI/Swagger شامل:

- Schema definitions
- Custom examples
- Error response templates
- Authentication schemas

#### Istanbul_Plus_API.postman_collection.json

مجموعه کامل Postman برای تست API:

- تمام endpoints
- Environment variables
- Automated token management
- Test scripts

## ویژگی‌های سیستم احراز هویت

### 🔐 احراز هویت

- ثبت‌نام و ورود با JWT
- احراز هویت دو مرحله‌ای (OTP)
- ورود با ایمیل یا شماره موبایل
- بازیابی رمز عبور

### 📱 تأیید هویت

- تأیید ایمیل با لینک
- تأیید شماره موبایل با SMS
- ارسال OTP از طریق ایمیل یا SMS

### 👤 مدیریت پروفایل

- ویرایش اطلاعات شخصی
- آپلود عکس پروفایل
- تنظیمات اطلاع‌رسانی
- تغییر رمز عبور

### 🛡 امنیت

- مدیریت جلسات فعال
- Rate limiting
- قفل خودکار حساب
- لاگ رویدادهای امنیتی
- هشدارهای امنیتی

## نحوه استفاده از مستندات

### برای کاربران عادی

1. `USER_GUIDE.md` را مطالعه کنید
2. مراحل ثبت‌نام و ورود را دنبال کنید
3. تنظیمات امنیتی را فعال کنید

### برای توسعه‌دهندگان

1. `API_DOCUMENTATION_INDEX.md` را برای شروع سریع مطالعه کنید
2. از Swagger UI برای تست تعاملی استفاده کنید
3. Postman collection را برای تست‌های پیشرفته import کنید
4. `api_documentation.py` را برای customization بررسی کنید

### برای مدیران سیستم

1. `MIGRATION_GUIDE.md` را برای به‌روزرسانی مطالعه کنید
2. `SECURITY_DEPLOYMENT_CHECKLIST.md` را قبل از deployment بررسی کنید
3. تنظیمات امنیتی را طبق راهنما پیاده‌سازی کنید

## به‌روزرسانی مستندات

### نحوه به‌روزرسانی

1. **API Changes**: فایل `api_documentation.py` را به‌روزرسانی کنید
2. **User Features**: `USER_GUIDE.md` را تکمیل کنید
3. **Security Updates**: `SECURITY_DEPLOYMENT_CHECKLIST.md` را بررسی کنید
4. **Migration Steps**: `MIGRATION_GUIDE.md` را به‌روزرسانی کنید

### تولید خودکار مستندات

```bash
# تولید OpenAPI schema
python manage.py spectacular --file schema.yml

# بررسی مستندات
python manage.py check --deploy
```

## ابزارهای مفید

### مستندات آنلاین

- **Swagger UI**: `/api/docs/` - تست تعاملی API
- **ReDoc**: `/api/redoc/` - مستندات زیبا و خوانا
- **OpenAPI Schema**: `/api/schema/` - Schema خام JSON

### ابزارهای توسعه

- **Postman**: تست API endpoints
- **curl**: تست command line
- **HTTPie**: HTTP client ساده

### مانیتورینگ

- **Django Admin**: `/admin/` - مدیریت سیستم
- **Logs**: بررسی فایل‌های لاگ
- **Metrics**: مانیتورینگ performance

## مشارکت در مستندات

### راهنمای مشارکت

1. **Fork** کردن repository
2. **Branch** جدید برای تغییرات
3. **Commit** تغییرات با پیام واضح
4. **Pull Request** برای بررسی

### استانداردهای نوشتن

- استفاده از Markdown برای فرمت
- عنوان‌های واضح و سازمان‌یافته
- مثال‌های عملی و کاربردی
- لینک‌های داخلی برای navigation

## پشتیبانی

### راه‌های تماس

- **ایمیل**: docs@istanbulplus.ir
- **GitHub Issues**: برای گزارش مشکلات مستندات
- **Discord**: برای بحث و پرسش

### منابع اضافی

- **Blog**: آموزش‌ها و نکات
- **Video Tutorials**: راهنماهای تصویری
- **FAQ**: پاسخ سوالات متداول

## Changelog

### نسخه 1.0.0 (دی 1403)

- انتشار اولیه مستندات
- راهنمای کاربری کامل
- مستندات API جامع
- چک‌لیست امنیتی
- راهنمای مهاجرت

### برنامه آینده

- [ ] ترجمه به زبان انگلیسی
- [ ] ویدیوهای آموزشی
- [ ] SDK برای زبان‌های مختلف
- [ ] مثال‌های بیشتر

## License

این مستندات تحت مجوز اختصاصی Istanbul Plus منتشر شده‌اند.

---

**آخرین به‌روزرسانی**: دی 1403  
**نسخه**: 1.0.0  
**نگهدارنده**: تیم فنی Istanbul Plus
