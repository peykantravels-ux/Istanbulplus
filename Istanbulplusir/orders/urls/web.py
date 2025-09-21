from django.urls import path
from orders.views.web import OrderListView, OrderDetailView, CheckoutView

app_name = 'orders'

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/checkout/', CheckoutView.as_view(), name='checkout'),
]