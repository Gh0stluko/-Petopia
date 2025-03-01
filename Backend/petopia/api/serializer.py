from rest_framework import serializers
from django.db import models
from .models import CustomUser, Product, Image, Item_Category, Animal_Category, Cart, ProductRating

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'
        
    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
    
    
class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'

class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal_Category
        fields = '__all__'

class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = '__all__'

class ItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item_Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()

    images = ImageSerializer(many=True, read_only=True)
    Animal_Category = AnimalSerializer(many=True)
    Item_Category = ItemCategorySerializer(many=True)
    class Meta:
        model = Product
        fields = '__all__'

    def get_user_count(self, obj):
        return obj.ratings.count()

    def get_average_rating(self, obj):
        # Aggregate ratings and calculate the average
        average = obj.ratings.aggregate(models.Avg('rating'))['rating__avg']
        return round(average, 1) if average is not None else "no review"

class ItemSerialiazer(serializers.ModelSerializer):
    class Meta:
        model = Item_Category
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Cart
        fields = '__all__'


from rest_framework import serializers
from .models import Order, OrderItem, Product

class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price', 'image']
    
    def get_image(self, obj):
        try:
            product = Product.objects.get(id=obj.product_id)
            image = product.images.first()
            if image:
                request = self.context.get('request')
                if request is not None:
                    # This creates absolute URLs including domain
                    return request.build_absolute_uri(image.image.url)
                return image.image.url
            return None
        except Product.DoesNotExist:
            return None
            
    def get_product_details(self, obj):
        try:
            product = Product.objects.get(id=obj.product_id)
            return {
                'id': product.id,
                'name': product.name,
                'images': [{'image': image.image.url} for image in product.images.all()[:1]]
            }
        except Product.DoesNotExist:
            return None
class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'status', 'created_at', 'total_amount', 'payment_method',
                  'first_name', 'last_name', 'email', 'phone',
                  'shipping_city', 'shipping_address', 'items']
    
    def get_items(self, obj):
        order_items = OrderItem.objects.filter(order=obj)
        return OrderItemSerializer(order_items, many=True).data

class OrderDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'created_at', 'total_amount', 'payment_method',
            'first_name', 'last_name', 'email', 'phone',
            'shipping_city', 'shipping_address', 'items'
        ]
    
    def get_items(self, obj):
        order_items = OrderItem.objects.filter(order=obj)
        return OrderItemWithProductSerializer(order_items, many=True).data

class OrderItemWithProductSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price', 'product']
    
    def get_product(self, obj):
        try:
            product = Product.objects.get(id=obj.product_id)
            return {
                'id': product.id,
                'name': product.name,
                'images': [{'image': image.image.url} for image in product.images.all()[:1]]
            }
        except Product.DoesNotExist:
            return None