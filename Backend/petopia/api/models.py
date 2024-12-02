from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    address = models.TextField(blank=True)
    date_birth = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=25, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    registration_complete = models.BooleanField(default=False)
    wishlist = models.ManyToManyField('Product', related_name='wishlists', blank=True)
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock = models.IntegerField()
    Animal_Category = models.ManyToManyField('Animal_Category')
    Item_Category = models.ManyToManyField('Item_Category')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name
    
    @property
    def images(self):
        return self.image_set.all()
    @property
    def average_rating(self):
        return self.ratings.aggregate(average=models.Avg('rating'))['average'] or 0
    
class ProductRating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # Від 1 до 5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')  # Один користувач може оцінити товар лише раз

#create image class for product
class Image(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return self.product.name

#create category class
class Animal_Category(MPTTModel):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='categories/')
    description = models.TextField(blank=True)
    parent = TreeForeignKey('self', blank=True, null=True, on_delete=models.CASCADE, related_name='children')

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name
    
class Item_Category(MPTTModel):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='categories/')
    description = models.TextField(blank=True)
    parent = TreeForeignKey('self', blank=True, null=True, on_delete=models.CASCADE, related_name='children')

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name
    
#create cart class
class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    date_added = models.DateTimeField(auto_now_add=True)