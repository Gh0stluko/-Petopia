from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .liqpay import LiqPay
import json
import base64

@api_view(['GET'])
def order_payment(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        
        # Initialize LiqPay with your credentials
        liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
        
        # Generate payment form data
        payment_data = liqpay.generate_payment_form(
            order_id=order.id,
            amount=float(order.total_amount),
            description=f'Оплата замовлення #{order.id} на Petopia'
        )
        
        return Response(payment_data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def liqpay_callback(request):
    print(request.data)
    data = request.data.get('data')
    signature = request.data.get('signature')
    
    if not data or not signature:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Initialize LiqPay
    liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
    
    # Verify signature
    if not liqpay.verify_signature(data, signature):
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Decode payment data
    payment_data = json.loads(base64.b64decode(data).decode('utf-8'))
    
    # Check payment status
    if payment_data.get('status') == 'success':
        order_id = payment_data.get('order_id')
        
        try:
            order = Order.objects.get(id=order_id)
            order.paid = True
            order.save()
            print(f"Order {order_id} marked as paid")
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({'status': 'OK'})