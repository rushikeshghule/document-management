from django.db import models
from django.conf import settings
import uuid
import os
from django.utils import timezone


def document_file_path(instance, filename):
    """Generate file path for new document"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('documents', filename)


class Document(models.Model):
    """Document model for storing document information"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=document_file_path)
    file_size = models.BigIntegerField(default=0)  # Size in bytes
    file_type = models.CharField(max_length=50, blank=True)  # File extension/type
    content = models.TextField(blank=True, null=True)  # Extracted text content
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Update file size and type when saving"""
        if self.file:
            self.file_size = self.file.size
            filename = self.file.name
            self.file_type = filename.split('.')[-1].lower() if '.' in filename else ''
        super().save(*args, **kwargs)
    
    def record_access(self):
        """Record when a document is accessed"""
        self.last_accessed = timezone.now()
        self.save(update_fields=['last_accessed'])
    
    class Meta:
        ordering = ['-created_at']


class DocumentEmbedding(models.Model):
    """Model to store document embeddings for Q&A"""
    
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='embeddings'
    )
    chunk_text = models.TextField()
    embedding = models.JSONField(null=True, blank=True)
    chunk_index = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Embedding for {self.document.title} - Chunk {self.chunk_index}"
    
    class Meta:
        ordering = ['document', 'chunk_index']
