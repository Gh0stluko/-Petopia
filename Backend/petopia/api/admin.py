from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

# Register my admin models
from .models import CustomUser, Product, Image, Animal_Category, Item_Category, Cart

admin.site.register(CustomUser)
admin.site.register(Cart)

# Register categories with DraggableMPTTAdmin
admin.site.register(Animal_Category, DraggableMPTTAdmin)
admin.site.register(Item_Category, DraggableMPTTAdmin)

# Register product and specify image as inline
class ImageInline(admin.TabularInline):
    model = Image

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ImageInline]