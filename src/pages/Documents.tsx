
import { useState, useEffect } from 'react';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useAuth } from '@/contexts/AuthContext';
import { DOCUMENTS, getDocumentsForUser } from '@/services/mockData';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/utils';
import { DocumentAnnotation, DocumentVersion, DocumentActivity } from '@/types/document';

// Standard document categories
const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials",
  "Meeting Notes",
  "Final Deliverables"
];

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    document.title = 'Documents - Akros Advisory';
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center w-full">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-36 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userDocuments = getDocumentsForUser(user.id);

  const handleMarkAsReviewed = (documentId: string, reviewed: boolean) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document) {
      document.reviewed = reviewed;
      
      // Record activity
      logDocumentActivity(documentId, 'update', reviewed ? 'Marked as reviewed' : 'Marked as unreviewed');
    }
  };

  const handleAddComment = (documentId: string, comment: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document) {
      if (!document.comments) {
        document.comments = [];
      }
      
      document.comments.push({
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        content: comment,
        createdAt: new Date()
      });
      
      // Record activity
      logDocumentActivity(documentId, 'comment', 'Added a comment');
    }
  };
  
  const handleAddAnnotation = (annotation: DocumentAnnotation) => {
    const document = DOCUMENTS.find(doc => doc.id === annotation.documentId);
    if (document) {
      if (!document.annotations) {
        document.annotations = [];
      }
      
      document.annotations.push(annotation);
      
      // Record activity
      logDocumentActivity(document.id, 'annotate', 'Added an annotation');
      
      toast({
        title: 'Annotation added',
        description: `An annotation has been added to "${document.name}"`,
      });
    }
  };
  
  const handleAddTag = (documentId: string, tag: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document) {
      if (!document.tags) {
        document.tags = [];
      }
      
      document.tags.push(tag);
      
      // Record activity
      logDocumentActivity(documentId, 'update', `Added tag "${tag}"`);
    }
  };
  
  const handleRemoveTag = (documentId: string, tag: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document && document.tags) {
      document.tags = document.tags.filter(t => t !== tag);
      
      // Record activity
      logDocumentActivity(documentId, 'update', `Removed tag "${tag}"`);
    }
  };
  
  const handleRevertToVersion = (documentId: string, versionId: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document && document.versionHistory) {
      const version = document.versionHistory.find(v => v.id === versionId);
      if (version) {
        // In a real app, we would update the document content with the version content
        // For this demo, we'll just log it
        
        // Record activity
        logDocumentActivity(documentId, 'version', `Reverted to version ${version.version}`);
        
        toast({
          title: 'Version restored',
          description: `Document reverted to version ${version.version}`,
        });
      }
    }
  };
  
  const handleDownloadDocument = (documentId: string) => {
    // Record activity
    logDocumentActivity(documentId, 'download', 'Downloaded the document');
  };
  
  const handleViewDocument = (documentId: string) => {
    // Record activity
    logDocumentActivity(documentId, 'view', 'Viewed the document');
  };

  const handleUploadDocument = (
    file: File, 
    category: string, 
    metadata?: Record<string, string>, 
    tags?: string[], 
    isNewVersion?: boolean, 
    existingDocumentId?: string, 
    versionNotes?: string
  ) => {
    // Handle new version of existing document
    if (isNewVersion && existingDocumentId) {
      const existingDocument = DOCUMENTS.find(doc => doc.id === existingDocumentId);
      if (existingDocument) {
        // Determine next version number
        const nextVersion = (existingDocument.versionHistory?.length || 0) + 1;
        
        // Create new version
        const newVersion: DocumentVersion = {
          id: uuidv4(),
          documentId: existingDocument.id,
          version: nextVersion,
          url: URL.createObjectURL(file),
          uploadedBy: user.id,
          uploadedAt: new Date(),
          changes: versionNotes || `Version ${nextVersion}`,
          size: file.size
        };
        
        // Add version to history
        if (!existingDocument.versionHistory) {
          existingDocument.versionHistory = [];
        }
        existingDocument.versionHistory.push(newVersion);
        
        // Update document properties
        existingDocument.url = newVersion.url;
        existingDocument.size = file.size;
        existingDocument.uploadedAt = new Date();
        existingDocument.version = nextVersion;
        
        // Record activity
        logDocumentActivity(existingDocument.id, 'version', `Uploaded version ${nextVersion}`);
        
        toast({
          title: 'New version uploaded',
          description: `Version ${nextVersion} of "${existingDocument.name}" has been uploaded.`,
        });
        
        return;
      }
    }
    
    // Handle new document
    const newDocument = {
      id: uuidv4(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedBy: user.id,
      uploadedAt: new Date(),
      category,
      visibleTo: [user.id],
      reviewed: false,
      version: 1,
      versionHistory: [
        {
          id: uuidv4(),
          documentId: '', // Will be updated after creating the document
          version: 1,
          url: URL.createObjectURL(file),
          uploadedBy: user.id,
          uploadedAt: new Date(),
          changes: 'Initial version',
          size: file.size
        }
      ],
      tags,
      metadata
    };
    
    // Update document ID in version history
    newDocument.versionHistory[0].documentId = newDocument.id;
    
    // Add to documents
    DOCUMENTS.push(newDocument);
    
    // Record activity
    logDocumentActivity(newDocument.id, 'upload', 'Uploaded new document');
    
    toast({
      title: 'Document uploaded',
      description: `${file.name} has been uploaded successfully.`,
    });
  };
  
  const logDocumentActivity = (documentId: string, activity: 'upload' | 'download' | 'view' | 'update' | 'delete' | 'comment' | 'annotate' | 'version', details?: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (!document) return;
    
    // In a real app, we would persist this to a database
    const activityRecord: DocumentActivity = {
      id: uuidv4(),
      documentId,
      userId: user.id,
      userName: user.name,
      activity,
      details,
      timestamp: new Date()
    };
    
    console.log('Document activity logged:', activityRecord);
    
    // In a real app, this would be sent to the server
    return activityRecord;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">Documents</h1>
        <p className="text-muted-foreground">
          Manage and access your documents
        </p>
      </div>
      
      <DocumentsList 
        documents={userDocuments} 
        onMarkAsReviewed={handleMarkAsReviewed}
        onAddComment={handleAddComment}
        onAddAnnotation={handleAddAnnotation}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onUploadClick={() => setShowUploadModal(true)}
        onDownload={handleDownloadDocument}
        onView={handleViewDocument}
      />
      
      <DocumentUpload 
        onUpload={handleUploadDocument}
        existingDocuments={userDocuments}
      />
    </div>
  );
};

export default Documents;
