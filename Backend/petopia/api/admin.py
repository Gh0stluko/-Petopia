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


from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'price')
    fields = ('product', 'product_name', 'quantity', 'price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone', 'status', 'payment_method', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'shipping_city', 'shipping_address')
    readonly_fields = ('created_at',)
    inlines = [OrderItemInline]
    fieldsets = (
        ('Клієнт', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Доставка', {
            'fields': ('shipping_city', 'shipping_address')
        }),
        ('Оплата та статус', {
            'fields': ('payment_method', 'status', 'total_amount', 'created_at')
        }),
    )
    list_per_page = 25
    date_hierarchy = 'created_at'
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Ім\'я та прізвище'
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Позначити як 'В обробці'"
    
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Позначити як 'Відправлено'"
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Позначити як 'Доставлено'"