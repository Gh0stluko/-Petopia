from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

# Register my admin models
from .models import CustomUser, Product, Image, Animal_Category, Item_Category, Cart, ProductRating

admin.site.register(CustomUser)
admin.site.register(Cart)

# Register categories with DraggableMPTTAdmin
admin.site.register(Animal_Category, DraggableMPTTAdmin)
admin.site.register(Item_Category, DraggableMPTTAdmin)

# Register product and specify image as inline
class ImageInline(admin.TabularInline):
    model = Image
    extra = 0
class ProductRatingInline(admin.TabularInline):
    model = ProductRating
    extra = 0  # Don't show extra empty forms by default
    fields = ('user', 'rating', 'created_at')  # Fields visible in inline
    readonly_fields = ('created_at',)  # Make created_at read-only


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ImageInline, ProductRatingInline]