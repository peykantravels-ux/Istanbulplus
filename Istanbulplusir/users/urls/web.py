from django.urls import path
from users.views.web import (
    RegisterTemplateView, LoginTemplateView, ProfileTemplateView,
    LogoutView, PasswordResetRequestView, PasswordResetVerifyView,
    EmailVerificationView, VerificationStatusView, PhoneVerificationView
)

app_name = 'users'

urlpatterns = [
    path('register/', RegisterTemplateView.as_view(), name='register'),
    path('login/', LoginTemplateView.as_view(), name='login'),
    path('profile/', ProfileTemplateView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Password reset URLs
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', PasswordResetVerifyView.as_view(), name='password-reset-verify'),
    
    # Verification URLs
    path('verify-email/<str:token>/', EmailVerificationView.as_view(), name='verify-email'),
    path('verification-status/', VerificationStatusView.as_view(), name='verification-status'),
    path('verify-phone/', PhoneVerificationView.as_view(), name='verify-phone'),
]