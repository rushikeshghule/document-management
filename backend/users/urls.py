from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CreateUserView, ManageUserView, UserSettingsViewSet

app_name = 'users'

router = DefaultRouter()
router.register('', UserViewSet, basename='users')

# Settings router
settings_router = DefaultRouter()
settings_router.register('', UserSettingsViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
    path('create/', CreateUserView.as_view(), name='create'),
    path('me/', ManageUserView.as_view(), name='me'),
    path('settings/', include(settings_router.urls)),
] 