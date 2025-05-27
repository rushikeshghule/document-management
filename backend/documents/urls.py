from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentEmbeddingViewSet

app_name = 'documents'

router = DefaultRouter()
router.register('', DocumentViewSet)

# Nested router for document embeddings
embedding_patterns = [
    path('<int:document_id>/embeddings/', DocumentEmbeddingViewSet.as_view({'get': 'list'}), name='document-embeddings'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('', include(embedding_patterns)),
] 