from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from cart.models import Cart, CartItem
from cart.serializers import CartSerializer, CartItemSerializer


class CartDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.cart


class CartItemCreateAPIView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(cart=self.request.cart)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)


class CartItemUpdateAPIView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(cart=self.request.cart)


class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(cart=self.request.cart)


class CartCountAPIView(APIView):
    def get(self, request, *args, **kwargs):
        if hasattr(request, 'cart'):
            count = request.cart.items.count()
            return Response({'count': count})
        return Response({'count': 0})