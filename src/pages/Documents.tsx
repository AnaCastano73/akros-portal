
import { useState, useEffect } from 'react';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useAuth } from '@/contexts/AuthContext';
import { getDocumentsForUser } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';
import { Document, DocumentAnnotation, DocumentActivity } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { v4 as uuidv4 } from '@/lib/utils';

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
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    document.title = 'Documents - Akros Advisory';
    if (user) {
      fetchDocuments();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const docs = await getDocumentsForUser(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleMarkAsReviewed = async (documentId: string, reviewed: boolean) => {
    try {
      const { error } = await supabaseTyped
        .from('documents')
        .update({ reviewed })
        .eq('id', documentId);
        
      if (error) throw error;
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => doc.id === documentId ? { ...doc, reviewed } : doc)
      );
      
      // Record activity
      logDocumentActivity(documentId, 'update', reviewed ? 'Marked as reviewed' : 'Marked as unreviewed');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleAddComment = (documentId: string, comment: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document && user) {
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
      
      // Update state to trigger re-render
      setDocuments([...documents]);
      
      // Record activity
      logDocumentActivity(documentId, 'comment', 'Added a comment');
    }
  };
  
  const handleAddAnnotation = (annotation: DocumentAnnotation) => {
    const document = documents.find(doc => doc.id === annotation.documentId);
    if (document) {
      if (!document.annotations) {
        document.annotations = [];
      }
      
      document.annotations.push(annotation);
      
      // Update state to trigger re-render
      setDocuments([...documents]);
      
      // Record activity
      logDocumentActivity(document.id, 'annotate', 'Added an annotation');
      
      toast({
        title: 'Annotation added',
        description: `An annotation has been added to "${document.name}"`,
      });
    }
  };
  
  const handleAddTag = async (documentId: string, tag: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      const updatedTags = [...(document.tags || []), tag];
      
      try {
        const { error } = await supabaseTyped
          .from('documents')
          .update({ tags: updatedTags })
          .eq('id', documentId);
          
        if (error) throw error;
        
        // Update local state
        setDocuments(prevDocs => 
          prevDocs.map(doc => doc.id === documentId ? { ...doc, tags: updatedTags } : doc)
        );
        
        // Record activity
        logDocumentActivity(documentId, 'update', `Added tag "${tag}"`);
      } catch (error) {
        console.error('Error updating document tags:', error);
      }
    }
  };
  
  const handleRemoveTag = async (documentId: string, tag: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document && document.tags) {
      const updatedTags = document.tags.filter(t => t !== tag);
      
      try {
        const { error } = await supabaseTyped
          .from('documents')
          .update({ tags: updatedTags })
          .eq('id', documentId);
          
        if (error) throw error;
        
        // Update local state
        setDocuments(prevDocs => 
          prevDocs.map(doc => doc.id === documentId ? { ...doc, tags: updatedTags } : doc)
        );
        
        // Record activity
        logDocumentActivity(documentId, 'update', `Removed tag "${tag}"`);
      } catch (error) {
        console.error('Error updating document tags:', error);
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

  const handleUploadDocument = async (
    file: File, 
    category: string, 
    metadata?: Record<string, any>, 
    tags?: string[], 
    isNewVersion?: boolean, 
    existingDocumentId?: string, 
    versionNotes?: string
  ) => {
    if (!user) return;
    
    try {
      // Generate a unique file name
      const fileName = `${Date.now()}_${file.name}`;
      
      // In a production app, you would upload to Storage
      // For this example, we'll use a data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        // Handle new version of existing document
        if (isNewVersion && existingDocumentId) {
          const existingDocument = documents.find(doc => doc.id === existingDocumentId);
          if (existingDocument) {
            // Update the document with new version info
            const { error } = await supabaseTyped
              .from('documents')
              .update({
                url: fileUrl,
                size: file.size,
                version: (existingDocument.version || 1) + 1,
                uploaded_at: new Date().toISOString()
              })
              .eq('id', existingDocumentId);
              
            if (error) throw error;
            
            // Update local state
            setDocuments(prevDocs => 
              prevDocs.map(doc => {
                if (doc.id === existingDocumentId) {
                  return {
                    ...doc,
                    url: fileUrl,
                    size: file.size,
                    uploadedAt: new Date(),
                    version: (doc.version || 1) + 1
                  };
                }
                return doc;
              })
            );
            
            // Record activity
            logDocumentActivity(
              existingDocumentId, 
              'version', 
              `Uploaded version ${(existingDocument.version || 1) + 1}`
            );
            
            toast({
              title: 'New version uploaded',
              description: `Version ${(existingDocument.version || 1) + 1} of "${existingDocument.name}" has been uploaded.`,
            });
            
            return;
          }
        }
        
        // Handle new document
        const { data, error } = await supabaseTyped
          .from('documents')
          .insert({
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size,
            uploaded_by: user.id,
            category,
            visible_to: [user.id],
            version: 1,
            tags,
            metadata
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add to local state
        const newDocument: Document = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: data.type,
          size: data.size,
          uploadedBy: data.uploaded_by,
          uploadedAt: new Date(data.uploaded_at),
          category: data.category,
          visibleTo: data.visible_to,
          reviewed: false,
          version: 1,
          tags: data.tags || [],
          metadata: data.metadata || {},
          comments: [],
          annotations: []
        };
        
        setDocuments(prev => [newDocument, ...prev]);
        
        // Record activity
        logDocumentActivity(data.id, 'upload', 'Uploaded new document');
        
        toast({
          title: 'Document uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading the document',
        variant: 'destructive'
      });
    }
  };
  
  const logDocumentActivity = (documentId: string, activity: 'upload' | 'download' | 'view' | 'update' | 'delete' | 'comment' | 'annotate' | 'version', details?: string) => {
    if (!user) return;
    
    const document = documents.find(doc => doc.id === documentId);
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
        documents={documents} 
        onMarkAsReviewed={handleMarkAsReviewed}
        onAddComment={handleAddComment}
        onAddAnnotation={handleAddAnnotation}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onUploadClick={() => {}} // DocumentUpload component handles this now
        onDownload={handleDownloadDocument}
        onView={handleViewDocument}
      />
      
      <DocumentUpload 
        onUpload={handleUploadDocument}
        existingDocuments={documents}
      />
    </div>
  );
};

export default Documents;
