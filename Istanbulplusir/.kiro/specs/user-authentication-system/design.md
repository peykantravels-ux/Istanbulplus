# طراحی سیستم احراز هویت و مدیریت کاربران

## نمای کلی

این مستند طراحی جامع سیستم احراز هویت و مدیریت کاربران برای پروژه Django را ارائه می‌دهد. طراحی بر اساس نیازمندی‌های تعریف شده و با در نظر گیری بهترین شیوه‌های امنیتی انجام شده است.

## معماری

### معماری کلی سیستم

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Templates +  │◄──►│   (Django +     │◄──►│   Services      │
│    JavaScript)  │    │    DRF + JWT)   │    │   (Email, SMS)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### لایه‌های سیستم

1. **لایه ارائه (Presentation Layer)**

   - Templates HTML با Bootstrap
   - JavaScript برای تعامل AJAX
   - API endpoints برای mobile/SPA

2. **لایه منطق تجاری (Business Logic Layer)**

   - Services برای OTP، Email، SMS
   - Validators برای امنیت
   - Managers سفارشی برای کاربران

3. **لایه داده (Data Layer)**
   - مدل‌های Django
   - Cache برای rate limiting
   - Session management

## کامپوننت‌ها و رابط‌ها

### 1. مدل‌های داده

#### مدل User (بهبود یافته)

```python
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True, blank=True)

    # فیلدهای جدید
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    birth_date = models.DateField(blank=True, null=True)

    # وضعیت تأیید
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    # امنیت
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)

    # تنظیمات
    two_factor_enabled = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
```

#### مدل OtpCode (بهبود یافته)

```python
class OtpCode(models.Model):
    DELIVERY_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
    ]

    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('register', 'Register'),
        ('password_reset', 'Password Reset'),
        ('email_verify', 'Email Verification'),
        ('phone_verify', 'Phone Verification'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    contact_info = models.CharField(max_length=255)  # email or phone
    delivery_method = models.CharField(max_length=10, choices=DELIVERY_CHOICES)
    hashed_code = models.CharField(max_length=64)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField()
```

#### مدل UserSession (جدید)

```python
class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

#### مدل PasswordResetToken (جدید)

```python
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField()
```

### 2. سرویس‌ها

#### سرویس OTP (بهبود یافته)

```python
class OTPService:
    @staticmethod
    def send_otp(contact_info, delivery_method, purpose, user=None, ip_address=None):
        # Rate limiting check
        # Generate and hash OTP
        # Send via SMS or Email
        # Store in database

    @staticmethod
    def verify_otp(contact_info, code, purpose, ip_address=None):
        # Verify code
        # Update attempts
        # Mark as used if valid

    @staticmethod
    def cleanup_expired_otps():
        # Clean up expired OTP codes
```

#### سرویس ایمیل (جدید)

```python
class EmailService:
    @staticmethod
    def send_otp_email(email, code, purpose):
        # Send OTP via email with HTML template

    @staticmethod
    def send_verification_email(user):
        # Send email verification link

    @staticmethod
    def send_password_reset_email(user, token):
        # Send password reset link

    @staticmethod
    def send_security_alert(user, event, ip_address):
        # Send security alert emails
```

#### سرویس امنیت (جدید)

```python
class SecurityService:
    @staticmethod
    def check_rate_limit(ip_address, action):
        # Check rate limiting using cache

    @staticmethod
    def log_security_event(user, event, ip_address, details):
        # Log security events

    @staticmethod
    def check_suspicious_activity(user, ip_address):
        # Detect suspicious login patterns

    @staticmethod
    def lock_user_account(user, duration_minutes=30):
        # Temporarily lock user account
```

### 3. API Endpoints

#### احراز هویت

- `POST /api/auth/register/` - ثبت‌نام
- `POST /api/auth/login/` - ورود
- `POST /api/auth/logout/` - خروج
- `POST /api/auth/refresh/` - تجدید توکن
- `POST /api/auth/send-otp/` - ارسال OTP
- `POST /api/auth/verify-otp/` - تأیید OTP

#### بازیابی رمز عبور

- `POST /api/auth/password-reset/request/` - درخواست بازیابی
- `POST /api/auth/password-reset/verify/` - تأیید توکن
- `POST /api/auth/password-reset/confirm/` - تنظیم رمز جدید

#### تأیید حساب

- `POST /api/auth/verify-email/` - تأیید ایمیل
- `POST /api/auth/verify-phone/` - تأیید موبایل
- `POST /api/auth/resend-verification/` - ارسال مجدد تأیید

#### مدیریت پروفایل

- `GET /api/auth/profile/` - دریافت پروفایل
- `PUT /api/auth/profile/` - به‌روزرسانی پروفایل
- `POST /api/auth/change-password/` - تغییر رمز عبور
- `GET /api/auth/sessions/` - لیست جلسات فعال
- `DELETE /api/auth/sessions/{id}/` - حذف جلسه خاص
- `POST /api/auth/logout-all/` - خروج از همه دستگاه‌ها

### 4. رابط کاربری وب

#### صفحات اصلی

- `/auth/login/` - صفحه ورود
- `/auth/register/` - صفحه ثبت‌نام
- `/auth/password-reset/` - صفحه فراموشی رمز
- `/auth/verify-email/{token}/` - تأیید ایمیل
- `/auth/profile/` - پروفایل کاربری
- `/auth/security/` - تنظیمات امنیتی

## مدل‌های داده

### روابط بین جداول

```
User (1) ──── (N) OtpCode
User (1) ──── (N) UserSession
User (1) ──── (N) PasswordResetToken
User (1) ──── (N) SecurityLog
```

### فیلدهای کلیدی

**User Model:**

- `email_verified`: وضعیت تأیید ایمیل
- `phone_verified`: وضعیت تأیید موبایل
- `failed_login_attempts`: تعداد تلاش‌های ناموفق
- `locked_until`: زمان قفل حساب
- `two_factor_enabled`: فعال‌سازی احراز هویت دو مرحله‌ای

**OtpCode Model:**

- `delivery_method`: روش ارسال (SMS/Email)
- `purpose`: هدف استفاده
- `ip_address`: آدرس IP درخواست‌کننده

## مدیریت خطا

### انواع خطاها

1. **خطاهای احراز هویت**

   - اعتبارسنجی ناموفق
   - حساب قفل شده
   - OTP منقضی یا نامعتبر

2. **خطاهای امنیتی**

   - تجاوز از محدودیت نرخ
   - فعالیت مشکوک
   - IP مسدود شده

3. **خطاهای سیستمی**
   - خطا در ارسال SMS/Email
   - خطای پایگاه داده
   - خطای شبکه

### مدیریت خطا

```python
class AuthenticationError(Exception):
    """Base authentication error"""
    pass

class RateLimitExceeded(AuthenticationError):
    """Rate limit exceeded"""
    pass

class AccountLocked(AuthenticationError):
    """Account temporarily locked"""
    pass

class InvalidOTP(AuthenticationError):
    """Invalid or expired OTP"""
    pass
```

## استراتژی تست

### تست‌های واحد (Unit Tests)

1. **تست مدل‌ها**

   - تست validation rules
   - تست custom methods
   - تست relationships

2. **تست سرویس‌ها**

   - تست OTP generation/verification
   - تست email sending
   - تست rate limiting

3. **تست API**
   - تست authentication endpoints
   - تست error handling
   - تست permissions

### تست‌های یکپارچگی (Integration Tests)

1. **تست فرآیند کامل ثبت‌نام**
2. **تست فرآیند ورود با OTP**
3. **تست فرآیند بازیابی رمز عبور**
4. **تست مدیریت جلسات**

### تست‌های امنیتی

1. **تست rate limiting**
2. **تست brute force protection**
3. **تست session management**
4. **تست CSRF protection**

## ملاحظات امنیتی

### محافظت در برابر حملات

1. **Brute Force Protection**

   - محدودیت تعداد تلاش‌های ورود
   - قفل موقت حساب کاربری
   - Captcha برای IP های مشکوک

2. **Rate Limiting**

   - محدودیت ارسال OTP
   - محدودیت درخواست‌های API
   - استفاده از Redis برای cache

3. **Session Security**

   - JWT با expiration کوتاه
   - Refresh token rotation
   - Session invalidation

4. **Data Protection**
   - Hash کردن OTP codes
   - رمزگذاری داده‌های حساس
   - HTTPS اجباری

### بهترین شیوه‌ها

1. **Password Security**

   - استفاده از Django password validators
   - Hash کردن با bcrypt
   - اجبار به رمز قوی

2. **OTP Security**

   - کدهای 6 رقمی تصادفی
   - انقضای سریع (5 دقیقه)
   - محدودیت تعداد تلاش

3. **Communication Security**
   - استفاده از HTTPS
   - CSRF protection
   - XSS protection headers

## بهینه‌سازی عملکرد

### Caching Strategy

1. **Redis Cache**

   - Rate limiting counters
   - OTP verification attempts
   - Session data

2. **Database Optimization**
   - Indexing on frequently queried fields
   - Query optimization
   - Connection pooling

### Monitoring و Logging

1. **Security Events**

   - Failed login attempts
   - Suspicious activities
   - Rate limit violations

2. **Performance Metrics**

   - Response times
   - Error rates
   - Cache hit ratios

3. **Business Metrics**
   - Registration rates
   - Login success rates
   - OTP delivery success rates
