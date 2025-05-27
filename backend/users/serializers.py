from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserSettings

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add additional user data
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role', 'is_active', 'last_login')
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8, 'required': False},
            'last_login': {'read_only': True}
        }
    
    def create(self, validated_data):
        """Create a new user with encrypted password and return it"""
        return User.objects.create_user(**validated_data)
    
    def update(self, instance, validated_data):
        """Update and return user"""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user


class AccountSettingsSerializer(serializers.ModelSerializer):
    """Serializer for account settings section"""
    
    fullName = serializers.CharField(source='full_name')
    email = serializers.EmailField(source='user.email', read_only=True)
    jobTitle = serializers.CharField(source='job_title')
    department = serializers.CharField()
    
    class Meta:
        model = UserSettings
        fields = ('fullName', 'email', 'jobTitle', 'department')


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """Serializer for security settings section"""
    
    twoFactorEnabled = serializers.BooleanField(source='two_factor_enabled')
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = UserSettings
        fields = ('twoFactorEnabled', 'current_password', 'new_password')
    
    def validate(self, attrs):
        # Check if password change requested
        current_password = attrs.get('current_password')
        new_password = attrs.get('new_password')
        
        if new_password and not current_password:
            raise serializers.ValidationError({"current_password": "Current password is required to set new password"})
        
        if current_password and not new_password:
            raise serializers.ValidationError({"new_password": "New password is required"})
        
        # Verify current password if provided
        if current_password:
            user = self.instance.user
            if not user.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect"})
        
        return attrs
    
    def update(self, instance, validated_data):
        # Handle password change
        new_password = validated_data.pop('new_password', None)
        if new_password:
            user = instance.user
            user.set_password(new_password)
            user.save()
        
        return super().update(instance, validated_data)


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings section"""
    
    documentUpdates = serializers.BooleanField(source='document_updates')
    shareNotifications = serializers.BooleanField(source='share_notifications')
    commentNotifications = serializers.BooleanField(source='comment_notifications')
    taskReminders = serializers.BooleanField(source='task_reminders')
    systemUpdates = serializers.BooleanField(source='system_updates')
    
    class Meta:
        model = UserSettings
        fields = ('documentUpdates', 'shareNotifications', 'commentNotifications', 'taskReminders', 'systemUpdates')


class DisplaySettingsSerializer(serializers.ModelSerializer):
    """Serializer for display settings section"""
    
    theme = serializers.CharField()
    fontSize = serializers.CharField(source='font_size')
    defaultView = serializers.CharField(source='default_view')
    
    class Meta:
        model = UserSettings
        fields = ('theme', 'fontSize', 'defaultView')


class UserSettingsSerializer(serializers.ModelSerializer):
    """Full settings serializer that combines all settings sections"""
    
    account = serializers.SerializerMethodField()
    security = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()
    display = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSettings
        fields = ('account', 'security', 'notifications', 'display')
    
    def get_account(self, obj):
        return AccountSettingsSerializer(obj).data
    
    def get_security(self, obj):
        return {
            'twoFactorEnabled': obj.two_factor_enabled
        }
    
    def get_notifications(self, obj):
        return {
            'documentUpdates': obj.document_updates,
            'shareNotifications': obj.share_notifications,
            'commentNotifications': obj.comment_notifications,
            'taskReminders': obj.task_reminders,
            'systemUpdates': obj.system_updates
        }
    
    def get_display(self, obj):
        return {
            'theme': obj.theme,
            'fontSize': obj.font_size,
            'defaultView': obj.default_view
        }


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a user"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role')
        read_only_fields = ('id',)
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'viewer'),
            password=validated_data['password']
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a user"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id', 'email')
        
    def validate_role(self, value):
        # Only admins can update roles
        request = self.context.get('request')
        if request and request.user.role != 'admin' and value != self.instance.role:
            raise serializers.ValidationError("Only admins can update user roles.")
        return value 