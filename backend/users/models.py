from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserManager(BaseUserManager):
    """Custom user manager for User model"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as the unique identifier"""
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )
    
    username = None  # Remove username field
    email = models.EmailField('Email address', unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_editor(self):
        return self.role == 'editor'
    
    @property
    def is_viewer(self):
        return self.role == 'viewer'


class UserSettings(models.Model):
    """
    User settings model to store user preferences
    """
    # Link to User model (one-to-one relationship)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='settings',
        primary_key=True
    )

    # Account settings
    full_name = models.CharField(max_length=255, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    # Security settings
    two_factor_enabled = models.BooleanField(default=False)
    
    # Notification settings
    document_updates = models.BooleanField(default=True)
    share_notifications = models.BooleanField(default=True)
    comment_notifications = models.BooleanField(default=True)
    task_reminders = models.BooleanField(default=False)
    system_updates = models.BooleanField(default=True)
    
    # Display settings
    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    )
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    
    FONT_SIZE_CHOICES = (
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    )
    font_size = models.CharField(max_length=10, choices=FONT_SIZE_CHOICES, default='medium')
    
    VIEW_CHOICES = (
        ('list', 'List'),
        ('grid', 'Grid'),
    )
    default_view = models.CharField(max_length=10, choices=VIEW_CHOICES, default='list')
    
    def __str__(self):
        return f"Settings for {self.user.email}"


# Signal to create user settings when a user is created
@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance)

# Signal to save user settings when a user is saved
@receiver(post_save, sender=User)
def save_user_settings(sender, instance, **kwargs):
    instance.settings.save()
