from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class CartView(LoginRequiredMixin, TemplateView):
    template_name = 'cart/cart_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['cart'] = self.request.cart
        return context