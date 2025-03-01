import base64
import hashlib
import json

class LiqPay:
    def __init__(self, public_key, private_key):
        self.public_key = public_key
        self.private_key = private_key

    def generate_payment_form(self, order_id, amount, description):
        # Prepare data for LiqPay
        params = {
            'action': 'pay',
            'amount': amount,
            'currency': 'UAH',
            'description': description,
            'order_id': str(order_id),
            'version': '3',
            'public_key': self.public_key,
            'result_url': f'http:localhost:3000/order/success?order_id={order_id}',
            'server_url': 'https://0dd7-93-170-0-235.ngrok-free.app/api/liqpay/callback/'
        }
        
        # Generate signature
        data = base64.b64encode(json.dumps(params).encode('utf-8'))
        signature = base64.b64encode(hashlib.sha1((self.private_key + data.decode('utf-8') + self.private_key).encode('utf-8')).digest())
        
        return {
            'data': data.decode('utf-8'),
            'signature': signature.decode('utf-8')
        }

    def verify_signature(self, data, signature):
        calculated_signature = base64.b64encode(
            hashlib.sha1((self.private_key + data + self.private_key).encode('utf-8')).digest()
        ).decode('utf-8')
        
        return calculated_signature == signature