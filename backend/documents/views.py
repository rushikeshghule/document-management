from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Document, DocumentEmbedding
from .serializers import DocumentSerializer, DocumentEmbeddingSerializer, DocumentListSerializer
import threading
from django_filters.rest_framework import DjangoFilterBackend


class IsAdminOrEditor(permissions.BasePermission):
    """Permission to only allow admins or editors"""
    
    def has_permission(self, request, view):
        return request.user and (request.user.role in ['admin', 'editor'])


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing documents"""
    
    queryset = Document.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'file_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'last_accessed', 'title']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrEditor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter documents based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by user's access permissions
        user = self.request.user
        if user.is_admin or user.role == 'viewer':
            # Admins and viewers see all documents
            return queryset
        else:
            # Editors only see documents they uploaded
            return queryset.filter(uploaded_by=user)
    
    def perform_create(self, serializer):
        """Save the uploaded_by as the current user"""
        serializer.save(uploaded_by=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a document and update last_accessed timestamp
        """
        instance = self.get_object()
        # Record document access
        instance.record_access()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recently accessed documents
        """
        user = request.user
        # Get query parameters
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10
            
        # Get documents ordered by last_accessed
        queryset = self.get_queryset().filter(last_accessed__isnull=False).order_by('-last_accessed')[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def trigger_ingestion(self, request, pk=None):
        """Trigger the document ingestion process"""
        document = self.get_object()
        
        # Only allow ingestion for pending or failed documents
        if document.status not in ['pending', 'failed']:
            return Response(
                {"detail": f"Cannot trigger ingestion for document with status '{document.status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update document status
        document.status = 'processing'
        document.save()
        
        # Start ingestion in background thread
        threading.Thread(target=self._process_document, args=(document.id,)).start()
        
        return Response({"status": "ingestion started"})
    
    def _process_document(self, document_id):
        """Process the document in the background"""
        try:
            document = Document.objects.get(id=document_id)
            
            # Simulate document processing
            import time
            time.sleep(2)  # Simulate processing time
            
            # Extract text content based on file type
            content = ""
            file_ext = document.file_type.lower() if document.file_type else ""
            file_path = document.file.path
            
            try:
                # Simple text extraction based on file type
                if file_ext in ['txt', 'md', 'csv']:
                    # For text files, just read the content
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                elif file_ext in ['pdf']:
                    # For PDFs, extract text with a simple method
                    content = self._extract_text_from_pdf(file_path)
                elif file_ext in ['doc', 'docx']:
                    # For Word documents
                    content = self._extract_text_from_word(file_path)
                else:
                    # For other file types
                    content = f"File type {file_ext} is not supported for content extraction."
                    
                # Update document with extracted content
                document.content = content
            except Exception as e:
                document.content = f"Error extracting content: {str(e)}"
                
            # Create dummy embeddings for demonstration purposes
            for i in range(5):
                DocumentEmbedding.objects.create(
                    document=document,
                    chunk_text=f"Sample chunk {i} from {document.title}",
                    embedding={"values": [0.1, 0.2, 0.3]},  # Dummy embedding
                    chunk_index=i
                )
            
            # Update document status
            document.status = 'completed'
            document.save()
        except Exception as e:
            # Handle errors
            try:
                document = Document.objects.get(id=document_id)
                document.status = 'failed'
                document.save()
            except:
                pass
                
    def _extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            import PyPDF2
            text = ""
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    text += page.extract_text() + "\n\n"
            return text
        except ImportError:
            return "PDF extraction requires PyPDF2 library."
        except Exception as e:
            return f"Failed to extract PDF content: {str(e)}"
            
    def _extract_text_from_word(self, file_path):
        """Extract text from Word document"""
        try:
            import docx
            doc = docx.Document(file_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except ImportError:
            return "Word document extraction requires python-docx library."
        except Exception as e:
            return f"Failed to extract Word document content: {str(e)}"
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_document(self, request):
        """
        Upload a new document
        """
        # Check if the user is allowed to upload (admin or editor)
        if not request.user.role in ['admin', 'editor']:
            return Response(
                {"detail": "You do not have permission to upload documents."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if file is in the request
        if 'file' not in request.FILES:
            return Response(
                {"file": "No file was submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_obj = request.FILES['file']
        
        # Create document data
        data = {
            'title': request.data.get('title', file_obj.name),
            'description': request.data.get('description', ''),
            'file': file_obj,
        }
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentEmbeddingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing document embeddings"""
    
    serializer_class = DocumentEmbeddingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return embeddings for a specific document"""
        document_id = self.kwargs.get('document_id')
        return DocumentEmbedding.objects.filter(document_id=document_id)
