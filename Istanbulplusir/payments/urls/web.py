from django.urls import path
from payments.views.web import PaymentListView, PaymentDetailView, PaymentResultView

app_name = 'payments'

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment_list'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('result/<int:payment_id>/', PaymentResultView.as_view(), name='payment_result'),
]