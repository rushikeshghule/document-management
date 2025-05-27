from rest_framework import serializers
from .models import Document, DocumentEmbedding
from django.contrib.auth import get_user_model

User = get_user_model()


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for the Document model"""
    
    uploaded_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault()
    )
    
    # Add calculated fields
    name = serializers.SerializerMethodField()
    size = serializers.IntegerField(source='file_size', read_only=True)
    type = serializers.CharField(source='file_type', read_only=True)
    owner = serializers.CharField(source='uploaded_by.email', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = (
            'id', 'title', 'name', 'description', 'file', 'file_url', 'uploaded_by', 
            'created_at', 'updated_at', 'last_accessed', 'status', 'content',
            'size', 'type', 'owner'
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at', 'status', 'file_size', 
            'file_type', 'last_accessed', 'content'
        )
    
    def get_name(self, obj):
        """Get the name of the file (using the title or original filename)"""
        return obj.title
    
    def get_file_url(self, obj):
        """Get the file URL"""
        request = self.context.get('request')
        if request and hasattr(request, 'build_absolute_uri'):
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def validate_file(self, value):
        """Validate the file extension"""
        # List of allowed file extensions
        valid_extensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png']
        
        ext = value.name.split('.')[-1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension. Allowed extensions are: {', '.join(valid_extensions)}"
            )
        
        # Check file size (limit to 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
            
        return value


class DocumentEmbeddingSerializer(serializers.ModelSerializer):
    """Serializer for the DocumentEmbedding model"""
    
    class Meta:
        model = DocumentEmbedding
        fields = ('id', 'document', 'chunk_text', 'embedding', 'chunk_index', 'created_at')
        read_only_fields = ('id', 'created_at')


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer for listing documents"""
    
    uploaded_by_email = serializers.CharField(source='uploaded_by.email', read_only=True)
    name = serializers.SerializerMethodField()
    size = serializers.IntegerField(source='file_size', read_only=True)
    type = serializers.CharField(source='file_type', read_only=True)
    owner = serializers.CharField(source='uploaded_by.email', read_only=True)
    
    class Meta:
        model = Document
        fields = (
            'id', 'title', 'name', 'description', 'uploaded_by_email', 
            'created_at', 'updated_at', 'last_accessed', 'status',
            'size', 'type', 'owner'
        )
        read_only_fields = (
            'id', 'created_at', 'status', 'uploaded_by_email', 
            'updated_at', 'last_accessed', 'file_size', 'file_type'
        )
    
    def get_name(self, obj):
        """Get the name of the file (using the title or original filename)"""
        return obj.title 