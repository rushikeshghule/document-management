from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer, AccountSettingsSerializer,
    SecuritySettingsSerializer, NotificationSettingsSerializer, DisplaySettingsSerializer,
    UserSettingsSerializer
)
from .models import UserSettings

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """Permission to only allow admin users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class IsAdminOrSelf(permissions.BasePermission):
    """
    Permission to allow admins to access any user or users to access themselves
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access any user
        if request.user.role == 'admin':
            return True
        
        # Users can only access themselves
        return obj == request.user


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        """
        List all users (for admin users only)
        """
        if request.user.role != 'admin':
            return Response(
                {"detail": "You do not have permission to view user list."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset().order_by('email')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Allow users to retrieve their own user object
        """
        instance = self.get_object()
        if instance.id != request.user.id and request.user.role != 'admin':
            return Response(
                {"detail": "You do not have permission to view this user."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Prevent users from deleting themselves
        """
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
        
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """
        Update the active status of a user
        """
        if request.user.role != 'admin':
            return Response(
                {"detail": "You do not have permission to update user status."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        
        # Prevent deactivating your own account
        if instance.id == request.user.id and not request.data.get('is_active', True):
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user status
        instance.is_active = request.data.get('is_active', instance.is_active)
        instance.save(update_fields=['is_active'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system"""
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Retrieve and return authenticated user"""
        return self.request.user


class UserSettingsViewSet(viewsets.GenericViewSet):
    """ViewSet for managing user settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_settings(self):
        """Helper method to get the user settings"""
        return self.request.user.settings
    
    @action(detail=False, methods=['get'], url_path='all')
    def get_all_settings(self, request):
        """Get all user settings"""
        settings = self.get_settings()
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'patch'], url_path='account')
    def account_settings(self, request):
        """Get or update account settings"""
        settings = self.get_settings()
        
        if request.method == 'GET':
            serializer = AccountSettingsSerializer(settings)
            return Response(serializer.data)
        
        serializer = AccountSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch'], url_path='security')
    def security_settings(self, request):
        """Get or update security settings"""
        settings = self.get_settings()
        
        if request.method == 'GET':
            serializer = SecuritySettingsSerializer(settings)
            return Response(serializer.data)
        
        serializer = SecuritySettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch'], url_path='notifications')
    def notification_settings(self, request):
        """Get or update notification settings"""
        settings = self.get_settings()
        
        if request.method == 'GET':
            serializer = NotificationSettingsSerializer(settings)
            return Response(serializer.data)
        
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch'], url_path='display')
    def display_settings(self, request):
        """Get or update display settings"""
        settings = self.get_settings()
        
        if request.method == 'GET':
            serializer = DisplaySettingsSerializer(settings)
            return Response(serializer.data)
        
        serializer = DisplaySettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
