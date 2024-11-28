from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes, api_view, action
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Product, Image, Animal_Category,Item_Category, Cart
from rest_framework import viewsets
from .serializer import CustomUserSerializer, ProductSerializer, ImageSerializer, AnimalSerializer,ItemSerialiazer, CartSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile_complete(request):
    try:

        user = request.user
        username = request.data.get('username')
        password = request.data.get('password')
        gender = request.data.get('gender')
        dateOfBirth = request.data.get('dateOfBirth')
        firstName = request.data.get('firstName')
        lastName = request.data.get('lastName')
        avatar = request.FILES.get('avatar')
        print(avatar)
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            return Response(
                {'error': 'Username already taken'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.username = username
        user.set_password(password)
        user.gender = gender
        if dateOfBirth:

            user.date_birth = dateOfBirth
        user.first_name = firstName
        user.last_name = lastName

        user.avatar = avatar  # Directly assign the file

        user.registration_complete = True
        user.save()
        
        return Response({'message': 'Profile completed successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response({'error': 'An error occurred while completing profile'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def LoginView(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if email is None or password is None:
        return Response(
            {'error': 'Please provide both email and password.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    refresh = RefreshToken.for_user(user)
    
    # Create response with access token
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'username': user.username,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def RegisterView(request):
    if request.method == 'POST':
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser(username=username, email=email)
        user.set_password(password)
        user.date_joined = timezone.now()
        user.save()

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:

        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            print("old password is incorrect")
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'An error occurred while changing password'}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    try:
        user = request.user
        user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'An error occurred while deleting account'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token is None:
            return Response({'error': 'No refresh token provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
    except Exception as e:
        return Response({'error': 'An error occurred during logout.'}, status=status.HTTP_400_BAD_REQUEST)
      

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    @action(detail=False, methods=['put'], url_path='update_avatar')
    def update_avatar(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Retrieve the current authenticated user's data.
        """
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_me(self, request):
        """Update the current authenticated user's data."""
        user = request.user
        data = request.data

        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("error", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.db.models import Q
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Search query
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        # Animal category filter
        animal_categories = self.request.query_params.getlist('animal_category')
        if animal_categories:
            queryset = queryset.filter(Animal_Category__name__in=animal_categories)

        # Item category filter
        item_categories = self.request.query_params.getlist('item_category')
        if item_categories:
            queryset = queryset.filter(Item_Category__name__in=item_categories)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Sorting
        sort_by = self.request.query_params.get('sort_by')
        if sort_by:
            if sort_by == 'price_asc':
                queryset = queryset.order_by('price')
            elif sort_by == 'price_desc':
                queryset = queryset.order_by('-price')
            elif sort_by == 'newest':
                queryset = queryset.order_by('-created_at')

        return queryset.distinct()
class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

@permission_classes([AllowAny])
class AnimalCategoryViewSet(viewsets.ModelViewSet):
    queryset =  Animal_Category.objects.all()
    serializer_class = AnimalSerializer


@permission_classes([AllowAny])
class ItemCategoryViewSet(viewsets.ModelViewSet):
    queryset =  Item_Category.objects.all()
    serializer_class = ItemSerialiazer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import load_strategy, load_backend
from social_core.exceptions import MissingBackend, AuthTokenError, AuthForbidden
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

User = get_user_model()



@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    access_token = request.data.get('google_token')
    try:
        # Specify the CLIENT_ID of your app that you get from the Google Developer Console
        idinfo = id_token.verify_oauth2_token(access_token, requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        userid = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        # Check if the user exists
        email_prefix = email.split('@')[0]
        user, created = User.objects.get_or_create(email=email)
        
        if created:
            user.first_name = name.split()[0] if name else ''
            user.last_name = name.split()[-1] if name else ''
            user.date_joined = timezone.now()
            user.save()

        # Here you would typically create a session or return a token
        # For this example, we'll just return some user info

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return JsonResponse({
            'id': user.id,
            'email': user.email,
            'name': user.username,
            'access': access_token,
            'refresh': refresh_token,
        })

    except ValueError:
        # Invalid token
        return JsonResponse({'error': 'Invalid token'}, status=400)