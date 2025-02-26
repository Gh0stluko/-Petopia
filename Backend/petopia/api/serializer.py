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