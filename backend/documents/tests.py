from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Document, DocumentEmbedding

User = get_user_model()


class DocumentModelTests(TestCase):
    """Tests for the Document model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
    def test_create_document(self):
        """Test creating a document is successful."""
        document = Document.objects.create(
            title="Test Document",
            description="This is a test document",
            file=SimpleUploadedFile("test.txt", b"file content"),
            uploaded_by=self.user
        )
        
        self.assertEqual(document.title, "Test Document")
        self.assertEqual(document.description, "This is a test document")
        self.assertEqual(document.uploaded_by, self.user)
        self.assertEqual(document.status, 'pending')
        
    def test_document_str(self):
        """Test the document string representation."""
        document = Document.objects.create(
            title="Test Document",
            description="This is a test document",
            file=SimpleUploadedFile("test.txt", b"file content"),
            uploaded_by=self.user
        )
        
        self.assertEqual(str(document), document.title)
        
    def test_document_ordering(self):
        """Test that documents are ordered by created_at in descending order."""
        document1 = Document.objects.create(
            title="First Document",
            file=SimpleUploadedFile("test1.txt", b"file content"),
            uploaded_by=self.user
        )
        document2 = Document.objects.create(
            title="Second Document",
            file=SimpleUploadedFile("test2.txt", b"file content"),
            uploaded_by=self.user
        )
        
        documents = Document.objects.all()
        self.assertEqual(documents[0], document2)
        self.assertEqual(documents[1], document1)


class DocumentEmbeddingModelTests(TestCase):
    """Tests for the DocumentEmbedding model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.document = Document.objects.create(
            title="Test Document",
            file=SimpleUploadedFile("test.txt", b"file content"),
            uploaded_by=self.user
        )
        
    def test_create_embedding(self):
        """Test creating a document embedding is successful."""
        embedding = DocumentEmbedding.objects.create(
            document=self.document,
            chunk_text="This is a test chunk",
            embedding={"values": [0.1, 0.2, 0.3]},
            chunk_index=1
        )
        
        self.assertEqual(embedding.document, self.document)
        self.assertEqual(embedding.chunk_text, "This is a test chunk")
        self.assertEqual(embedding.embedding, {"values": [0.1, 0.2, 0.3]})
        self.assertEqual(embedding.chunk_index, 1)


class PublicDocumentAPITests(TestCase):
    """Test the publicly available document API"""
    
    def setUp(self):
        self.client = APIClient()
        
    def test_auth_required(self):
        """Test that authentication is required for document endpoints."""
        res = self.client.get(reverse('documents:document-list'))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateDocumentApiTests(TestCase):
    """Test API requests for documents that require authentication"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            role='admin'
        )
        self.editor_user = User.objects.create_user(
            email='editor@example.com',
            password='testpass123',
            role='editor'
        )
        self.viewer_user = User.objects.create_user(
            email='viewer@example.com',
            password='testpass123',
            role='viewer'
        )
        
    def test_list_documents(self):
        """Test retrieving a list of documents."""
        # Create some documents
        Document.objects.create(
            title="Admin Document",
            file=SimpleUploadedFile("admin.txt", b"file content"),
            uploaded_by=self.admin_user
        )
        Document.objects.create(
            title="Editor Document",
            file=SimpleUploadedFile("editor.txt", b"file content"),
            uploaded_by=self.editor_user
        )
        
        # Authenticate as viewer
        self.client.force_authenticate(user=self.viewer_user)
        res = self.client.get(reverse('documents:document-list'))
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        
    def test_create_document_by_editor(self):
        """Test creating a document by an editor user."""
        self.client.force_authenticate(user=self.editor_user)
        
        with open(__file__, 'rb') as file:
            res = self.client.post(
                reverse('documents:document-list'),
                {
                    'title': 'New Document',
                    'description': 'Test description',
                    'file': file
                },
                format='multipart'
            )
        
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        document = Document.objects.get(id=res.data['id'])
        self.assertEqual(document.title, 'New Document')
        self.assertEqual(document.uploaded_by, self.editor_user)
        
    def test_viewer_cannot_create_document(self):
        """Test that viewers cannot create documents."""
        self.client.force_authenticate(user=self.viewer_user)
        
        with open(__file__, 'rb') as file:
            res = self.client.post(
                reverse('documents:document-list'),
                {
                    'title': 'New Document',
                    'description': 'Test description',
                    'file': file
                },
                format='multipart'
            )
        
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
