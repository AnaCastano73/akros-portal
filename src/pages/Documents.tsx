
import { useState, useEffect } from 'react';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useAuth } from '@/contexts/AuthContext';
import { DOCUMENTS, getDocumentsForUser } from '@/services/mockData';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/utils';

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    document.title = 'Documents - Healthwise Advisory Hub';
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userDocuments = getDocumentsForUser(user.id);
  
  // Extract all unique categories from documents
  const allCategories = Array.from(
    new Set(DOCUMENTS.map(doc => doc.category))
  );

  const handleMarkAsReviewed = (documentId: string, reviewed: boolean) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document) {
      document.reviewed = reviewed;
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
    }
  };

  const handleUploadDocument = (file: File, category: string) => {
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
    };
    
    DOCUMENTS.push(newDocument);
    
    toast({
      title: 'Document uploaded',
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Documents</h1>
        <p className="text-muted-foreground">
          Manage and access your documents
        </p>
      </div>
      
      <DocumentsList 
        documents={userDocuments} 
        onMarkAsReviewed={handleMarkAsReviewed}
        onAddComment={handleAddComment}
        onUploadClick={() => setShowUploadModal(true)}
      />
      
      <DocumentUpload 
        categories={allCategories}
        onUpload={handleUploadDocument}
      />
    </div>
  );
};

export default Documents;
