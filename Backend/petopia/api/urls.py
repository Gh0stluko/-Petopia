from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CustomUserViewSet, ProductViewSet, ImageViewSet, ItemCategoryViewSet, AnimalCategoryViewSet, CartViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
router = DefaultRouter()
router.register(r'user', CustomUserViewSet)
router.register(r'products', ProductViewSet)
router.register(r'images', ImageViewSet)
router.register(r'item_categories', ItemCategoryViewSet)
router.register(r'animal_categories', AnimalCategoryViewSet)
router.register(r'carts', CartViewSet)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view, name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', views.google_auth, name='google_auth'),
    path('', include(router.urls)),
    path('change-password/', views.change_password, name='change-password'),
    path('delete-account/', views.delete_account, name='delete-account'),
    path('profile-complete/', views.profile_complete, name='profile-complete'),
    path('login/', views.LoginView, name='login'),
    path('register/', views.RegisterView, name='register'),
    path('logout/', views.logout, name='logout'),
]
