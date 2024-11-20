from rest_framework import serializers
from .models import CustomUser, Product, Image, Item_Category, Animal_Category, Cart

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


class ProductSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True, source='image_set')

    class Meta:
        model = Product
        fields = '__all__'

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