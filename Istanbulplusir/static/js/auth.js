// Authentication JavaScript functionality

class AuthManager {
    constructor() {
        this.csrfToken = this.getCookie('csrftoken');
        this.init();
    }

    init() {
        this.bindEvents();
        this.initPasswordStrength();
        this.initFormValidation();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Send OTP buttons
        document.querySelectorAll('.send-otp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSendOTP(e));
        });

        // Delivery method selection
        document.querySelectorAll('.delivery-method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDeliveryMethod(e));
        });

        // Password reset form
        const passwordResetForm = document.getElementById('password-reset-form');
        if (passwordResetForm) {
            passwordResetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        // Password reset verify form
        const passwordResetVerifyForm = document.getElementById('password-reset-verify-form');
        if (passwordResetVerifyForm) {
            passwordResetVerifyForm.addEventListener('submit', (e) => this.handlePasswordResetVerify(e));
        }

        // Verification forms
        const emailVerifyForm = document.getElementById('email-verify-form');
        if (emailVerifyForm) {
            emailVerifyForm.addEventListener('submit', (e) => this.handleEmailVerification(e));
        }

        const phoneVerifyForm = document.getElementById('phone-verify-form');
        if (phoneVerifyForm) {
            phoneVerifyForm.addEventListener('submit', (e) => this.handlePhoneVerification(e));
        }

        // Session management
        document.querySelectorAll('.logout-session-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLogoutSession(e));
        });

        const logoutAllBtn = document.getElementById('logout-all-btn');
        if (logoutAllBtn) {
            logoutAllBtn.addEventListener('click', (e) => this.handleLogoutAll(e));
        }
    }

    initPasswordStrength() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.id === 'password' || input.id === 'new_password') {
                input.addEventListener('input', (e) => this.checkPasswordStrength(e.target));
            }
        });
    }

    initFormValidation() {
        // Real-time validation for forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', (e) => this.validateField(e.target));
                input.addEventListener('input', (e) => this.clearFieldError(e.target));
            });
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);
        this.clearMessages();

        const formData = {
            username: form.username.value.trim(),
            password: form.password.value,
            otp_code: form.otp_code.value.trim()
        };

        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('ورود موفقیت‌آمیز بود. در حال انتقال...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect_url || '/';
                }, 1500);
            } else {
                this.showMessage(data.message || 'خطا در ورود', 'danger');
                
                // Show OTP field if needed
                if (data.otp_required) {
                    this.showOTPField();
                }
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validate passwords match
        if (form.password.value !== form.password_confirm.value) {
            this.showMessage('رمزهای عبور مطابقت ندارند', 'danger');
            return;
        }

        this.setLoading(submitBtn, true);
        this.clearMessages();

        const formData = {
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            password: form.password.value,
            first_name: form.first_name?.value.trim() || '',
            last_name: form.last_name?.value.trim() || '',
            otp_code: form.otp_code.value.trim()
        };

        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('ثبت‌نام موفقیت‌آمیز بود. در حال انتقال...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect_url || '/auth/login/';
                }, 1500);
            } else {
                this.showMessage(data.message || 'خطا در ثبت‌نام', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleSendOTP(e) {
        e.preventDefault();
        const btn = e.target;
        const form = btn.closest('form');
        
        let contactInfo = '';
        let deliveryMethod = 'sms';
        
        // Determine contact info and delivery method based on form
        if (form.id === 'login-form') {
            contactInfo = form.username.value.trim();
            deliveryMethod = this.getSelectedDeliveryMethod() || 'sms';
        } else if (form.id === 'register-form') {
            const selectedMethod = this.getSelectedDeliveryMethod();
            if (selectedMethod === 'email') {
                contactInfo = form.email.value.trim();
                deliveryMethod = 'email';
            } else {
                contactInfo = form.phone.value.trim();
                deliveryMethod = 'sms';
            }
        } else if (form.id === 'password-reset-form') {
            contactInfo = form.contact_info.value.trim();
            deliveryMethod = this.getSelectedDeliveryMethod() || 'email';
        }

        if (!contactInfo) {
            this.showMessage('لطفاً اطلاعات تماس را وارد کنید', 'warning');
            return;
        }

        this.setLoading(btn, true);

        try {
            const response = await fetch('/api/auth/send-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify({
                    contact_info: contactInfo,
                    delivery_method: deliveryMethod,
                    purpose: this.getOTPPurpose(form.id)
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                this.showOTPField();
                this.startOTPTimer(btn);
            } else {
                this.showMessage(data.message || 'خطا در ارسال کد', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(btn, false);
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);
        this.clearMessages();

        const formData = {
            contact_info: form.contact_info.value.trim(),
            delivery_method: this.getSelectedDeliveryMethod() || 'email'
        };

        try {
            const response = await fetch('/auth/password-reset/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                // Redirect to verification page
                setTimeout(() => {
                    window.location.href = `/auth/password-reset/verify/?contact_info=${encodeURIComponent(data.contact_info)}&delivery_method=${data.delivery_method}`;
                }, 2000);
            } else {
                this.showMessage(data.message || 'خطا در درخواست بازیابی', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handlePasswordResetVerify(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validate passwords match
        if (form.new_password.value !== form.confirm_password.value) {
            this.showMessage('رمزهای عبور مطابقت ندارند', 'danger');
            return;
        }

        this.setLoading(submitBtn, true);
        this.clearMessages();

        const formData = {
            contact_info: form.contact_info.value,
            otp_code: form.otp_code.value.trim(),
            new_password: form.new_password.value,
            confirm_password: form.confirm_password.value
        };

        try {
            const response = await fetch('/auth/password-reset/verify/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/auth/login/';
                }, 2000);
            } else {
                this.showMessage(data.message || 'خطا در تغییر رمز عبور', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleEmailVerification(e) {
        e.preventDefault();
        const btn = e.target;
        
        this.setLoading(btn, true);

        try {
            const response = await fetch('/auth/verification-status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify({
                    verification_type: 'email'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
            } else {
                this.showMessage(data.message || 'خطا در ارسال ایمیل تأیید', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(btn, false);
        }
    }

    async handlePhoneVerification(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);
        this.clearMessages();

        const formData = {
            otp_code: form.otp_code.value.trim()
        };

        try {
            const response = await fetch('/auth/phone-verification/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                // Update verification status in UI
                if (data.phone_verified) {
                    this.updateVerificationStatus('phone', true);
                }
            } else {
                this.showMessage(data.message || 'خطا در تأیید شماره موبایل', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleLogoutSession(e) {
        e.preventDefault();
        const btn = e.target;
        const sessionId = btn.dataset.sessionId;
        
        if (!confirm('آیا از حذف این جلسه اطمینان دارید؟')) {
            return;
        }

        this.setLoading(btn, true);

        try {
            const response = await fetch(`/api/auth/sessions/${sessionId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('جلسه با موفقیت حذف شد', 'success');
                // Remove session from UI
                btn.closest('.session-item').remove();
            } else {
                this.showMessage(data.message || 'خطا در حذف جلسه', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(btn, false);
        }
    }

    async handleLogoutAll(e) {
        e.preventDefault();
        const btn = e.target;
        
        if (!confirm('آیا از خروج از همه دستگاه‌ها اطمینان دارید؟')) {
            return;
        }

        this.setLoading(btn, true);

        try {
            const response = await fetch('/api/auth/logout-all/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('از همه دستگاه‌ها خارج شدید', 'success');
                setTimeout(() => {
                    window.location.href = '/auth/login/';
                }, 2000);
            } else {
                this.showMessage(data.message || 'خطا در خروج', 'danger');
            }
        } catch (error) {
            this.showMessage('خطای شبکه رخ داده است', 'danger');
        } finally {
            this.setLoading(btn, false);
        }
    }

    selectDeliveryMethod(e) {
        e.preventDefault();
        const btn = e.target.closest('.delivery-method-btn');
        const method = btn.dataset.method;
        
        // Remove active class from all buttons
        document.querySelectorAll('.delivery-method-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to selected button
        btn.classList.add('active');
        
        // Update hidden input if exists
        const methodInput = document.getElementById('delivery_method');
        if (methodInput) {
            methodInput.value = method;
        }
    }

    checkPasswordStrength(input) {
        const password = input.value;
        const strengthBar = input.parentElement.querySelector('.password-strength-bar');
        
        if (!strengthBar) return;

        let strength = 0;
        let strengthClass = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthClass = 'password-strength-weak';
                break;
            case 2:
                strengthClass = 'password-strength-fair';
                break;
            case 3:
                strengthClass = 'password-strength-good';
                break;
            case 4:
            case 5:
                strengthClass = 'password-strength-strong';
                break;
        }

        strengthBar.className = `password-strength-bar ${strengthClass}`;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Clear previous errors
        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'این فیلد الزامی است';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'فرمت ایمیل نامعتبر است';
        } else if (field.name === 'phone' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'فرمت شماره موبایل نامعتبر است';
        } else if (field.type === 'password' && value && value.length < 8) {
            isValid = false;
            message = 'رمز عبور باید حداقل 8 کاراکتر باشد';
        }

        if (!isValid) {
            this.showFieldError(field, message);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        let errorDiv = field.parentElement.querySelector('.invalid-feedback');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentElement.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showOTPField() {
        const otpField = document.querySelector('.otp-field');
        if (otpField) {
            otpField.style.display = 'block';
            otpField.querySelector('input').focus();
        }
    }

    startOTPTimer(btn) {
        let seconds = 60;
        const originalText = btn.textContent;
        
        btn.disabled = true;
        
        const timer = setInterval(() => {
            btn.textContent = `ارسال مجدد (${seconds})`;
            seconds--;
            
            if (seconds < 0) {
                clearInterval(timer);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }, 1000);
    }

    updateVerificationStatus(type, verified) {
        const statusElement = document.querySelector(`.${type}-verification-status`);
        if (statusElement) {
            statusElement.className = `verification-status ${verified ? 'verified' : 'unverified'}`;
            statusElement.innerHTML = verified 
                ? '<i class="bi bi-check-circle"></i> تأیید شده'
                : '<i class="bi bi-x-circle"></i> تأیید نشده';
        }
    }

    getSelectedDeliveryMethod() {
        const activeBtn = document.querySelector('.delivery-method-btn.active');
        return activeBtn ? activeBtn.dataset.method : null;
    }

    getOTPPurpose(formId) {
        switch (formId) {
            case 'login-form':
                return 'login';
            case 'register-form':
                return 'register';
            case 'password-reset-form':
                return 'password_reset';
            default:
                return 'login';
        }
    }

    setLoading(btn, loading) {
        if (loading) {
            btn.disabled = true;
            const spinner = '<span class="spinner-border spinner-border-sm me-2"></span>';
            btn.innerHTML = spinner + btn.textContent;
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.textContent.replace(/.*<\/span>/, '');
        }
    }

    showMessage(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    clearMessages() {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'mb-3';
        
        const firstCard = document.querySelector('.card');
        if (firstCard) {
            firstCard.parentElement.insertBefore(container, firstCard);
        } else {
            document.querySelector('.container').prepend(container);
        }
        
        return container;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^(\+98|0)?9\d{9}$/;
        return phoneRegex.test(phone);
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});