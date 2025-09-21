from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, TemplateView
from payments.models import Payment


class PaymentListView(LoginRequiredMixin, ListView):
    model = Payment
    template_name = 'payments/payment_list.html'
    context_object_name = 'payments'

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)


class PaymentDetailView(LoginRequiredMixin, DetailView):
    model = Payment
    template_name = 'payments/payment_detail.html'
    context_object_name = 'payment'

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)


class PaymentResultView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/payment_result.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        payment_id = self.kwargs.get('payment_id')
        try:
            payment = Payment.objects.get(id=payment_id, order__user=self.request.user)
            context['payment'] = payment
        except Payment.DoesNotExist:
            context['payment'] = None
        return context