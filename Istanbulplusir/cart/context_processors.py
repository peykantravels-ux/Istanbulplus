def cart_context(request):
    """
    Add cart to template context if user is authenticated
    """
    context = {'cart': None, 'cart_item_count': 0}
    if hasattr(request, 'cart'):
        context['cart'] = request.cart
        context['cart_item_count'] = request.cart.items.count()
    return context