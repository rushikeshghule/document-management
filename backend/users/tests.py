from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for the custom User model"""
    
    def test_create_user_with_email(self):
        """Test creating a user with an email is successful."""
        email = 'test@example.com'
        password = 'testpass123'
        user = User.objects.create_user(
            email=email,
            password=password
        )
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertEqual(user.role, 'viewer')
        
    def test_new_user_email_normalized(self):
        """Test email is normalized for new user."""
        email = 'test@EXAMPLE.com'
        user = User.objects.create_user(email=email, password='test123')
        
        self.assertEqual(user.email, email.lower())
        
    def test_new_user_invalid_email(self):
        """Test creating user with no email raises error."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='test123')
            
    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email='admin@example.com',
            password='test123'
        )
        
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertEqual(user.role, 'admin')


class PublicUserAPITests(TestCase):
    """Test the publicly available user API"""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_create_user_success(self):
        """Test creating a user is successful."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        res = self.client.post(reverse('authentication:register'), payload)
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)
        
    def test_user_with_email_exists_error(self):
        """Test error returned if user with email exists."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        User.objects.create_user(email=payload['email'], password='anything')
        
        res = self.client.post(reverse('authentication:register'), payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_password_too_short(self):
        """Test error returned if password less than 8 chars."""
        payload = {
            'email': 'test@example.com',
            'password': 'pw',
            'password_confirm': 'pw'
        }
        res = self.client.post(reverse('authentication:register'), payload)
        
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)
        
    def test_create_token_for_user(self):
        """Test generates token for valid credentials."""
        user_details = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
        }
        User.objects.create_user(**user_details)
        
        payload = {
            'email': user_details['email'],
            'password': user_details['password'],
        }
        res = self.client.post(reverse('authentication:login'), payload)
        
        self.assertIn('refresh', res.data)
        self.assertIn('access', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
    def test_create_token_bad_credentials(self):
        """Test returns error if credentials invalid."""
        User.objects.create_user(
            email='test@example.com',
            password='goodpass'
        )
        
        payload = {'email': 'test@example.com', 'password': 'badpass'}
        res = self.client.post(reverse('authentication:login'), payload)
        
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class PrivateUserApiTests(TestCase):
    """Test API requests that require authentication"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='viewer'
        )
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            role='admin'
        )
        self.client = APIClient()
        
    def test_retrieve_profile_unauthorized(self):
        """Test authentication is required for users."""
        res = self.client.get(f'/api/users/{self.user.id}/')
        
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user."""
        self.client.force_authenticate(user=self.user)
        res = self.client.get(f'/api/users/{self.user.id}/')
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], self.user.email)
        
    def test_only_admin_can_list_users(self):
        """Test only admin users can list all users."""
        # Regular user can't list users
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admin user can list users
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get('/api/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 2)
