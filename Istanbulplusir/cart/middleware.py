from cart.models import Cart

def cart_middleware(get_response):
    def middleware(request):
        if request.user.is_authenticated and not hasattr(request, 'cart'):
            cart, created = Cart.objects.get_or_create(user=request.user)
            request.cart = cart
        
        response = get_response(request)
        return response
    
    return middleware