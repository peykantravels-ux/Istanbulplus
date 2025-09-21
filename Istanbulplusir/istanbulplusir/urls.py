from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, 
    TokenVerifyView, TokenBlacklistView
)
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT Authentication URLs
    path('api/token/', include([
        # Token URLs
        path('', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('verify/', TokenVerifyView.as_view(), name='token_verify'),
        path('blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    ])),
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API URLs
    path('api/', include([
        path('auth/', include(('users.urls.api', 'users'), namespace='api_auth')),
        path('users/', include(('users.urls.api', 'users'), namespace='api_users')),
        path('products/', include(('products.urls.api', 'products'), namespace='api_products')),
        path('cart/', include(('cart.urls.api', 'cart'), namespace='api_cart')),
        path('orders/', include(('orders.urls.api', 'orders'), namespace='api_orders')),
        path('payments/', include(('payments.urls.api', 'payments'), namespace='api_payments')),
    ])),
    # Frontend URLs
    path('users/', include(('users.urls.web', 'users'), namespace='users')),
    path('products/', include(('products.urls.web', 'products'), namespace='products')),
    path('cart/', include(('cart.urls.web', 'cart'), namespace='cart')),
    path('orders/', include(('orders.urls.web', 'orders'), namespace='orders')),
    path('payments/', include(('payments.urls.web', 'payments'), namespace='payments')),
    path('', include('core.urls')),
]

# Add Django Debug Toolbar URLs
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
    # Add media files serving in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Static files are automatically served by django.contrib.staticfiles in DEBUG mode
