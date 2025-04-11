
import { useState, useEffect } from 'react';
import { DocumentCategoryCard } from '@/components/documents/DocumentCategoryCard';
import { DocumentCategoryView } from '@/components/documents/DocumentCategoryView';
import { useAuth } from '@/contexts/AuthContext';
import { getDocumentsForUser } from '@/services/dataService';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentAnnotation, DocumentActivity } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { v4 as uuidv4 } from '@/lib/utils';
import { FileText, FileImage, BookOpen, FileCheck, Building } from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials", 
  "Meeting Notes",
  "Final Deliverables",
  "Company Documents"
];

const CATEGORY_DESCRIPTIONS = {
  "Session Homework": "Assignments to complete between sessions",
  "Client Materials": "Resources shared with you by your advisor",
  "Meeting Notes": "Notes and summaries from your meetings",
  "Final Deliverables": "Final reports and completed materials",
  "Company Documents": "Documents shared with your entire company"
};

const CATEGORY_ICONS = {
  "Session Homework": <BookOpen className="h-8 w-8 text-blue-500" />,
  "Client Materials": <FileText className="h-8 w-8 text-green-500" />,
  "Meeting Notes": <FileImage className="h-8 w-8 text-yellow-500" />,
  "Final Deliverables": <FileCheck className="h-8 w-8 text-purple-500" />,
  "Company Documents": <Building className="h-8 w-8 text-indigo-500" />
};

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Documents - Healthwise Advisory';
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

  const getDocumentCountByCategory = (category: string): number => {
    if (category === "Company Documents") {
      return documents.filter(doc => doc.companyId).length;
    }
    return documents.filter(doc => doc.category === category).length;
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
      
      setDocuments(prevDocs => 
        prevDocs.map(doc => doc.id === documentId ? { ...doc, reviewed } : doc)
      );
      
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
      
      setDocuments([...documents]);
      
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
      
      setDocuments([...documents]);
      
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
        
        setDocuments(prevDocs => 
          prevDocs.map(doc => doc.id === documentId ? { ...doc, tags: updatedTags } : doc)
        );
        
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
        
        setDocuments(prevDocs => 
          prevDocs.map(doc => doc.id === documentId ? { ...doc, tags: updatedTags } : doc)
        );
        
        logDocumentActivity(documentId, 'update', `Removed tag "${tag}"`);
      } catch (error) {
        console.error('Error updating document tags:', error);
      }
    }
  };
  
  const handleDownloadDocument = (documentId: string) => {
    logDocumentActivity(documentId, 'download', 'Downloaded the document');
  };
  
  const handleViewDocument = (documentId: string) => {
    logDocumentActivity(documentId, 'view', 'Viewed the document');
  };

  const handleUploadDocument = async (file: File, category: string) => {
    if (!user) return;
    
    try {
      const fileName = `${Date.now()}_${file.name}`;
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        // Determine if this is a company document
        const isCompanyDocument = category === "Company Documents";
        const insertData: any = {
          name: file.name,
          url: fileUrl,
          type: file.type,
          size: file.size,
          uploaded_by: user.id,
          category: isCompanyDocument ? "Company Documents" : category,
          visible_to: [user.id],
          version: 1,
          tags: []
        };
        
        // If uploading to company documents and user has a company
        if (isCompanyDocument && user.companyId) {
          insertData.company_id = user.companyId;
        }
        
        const { data, error } = await supabaseTyped
          .from('documents')
          .insert(insertData)
          .select()
          .single();
          
        if (error) throw error;
        
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
          companyId: data.company_id,
          reviewed: false,
          version: 1,
          tags: [],
          metadata: {},
          comments: [],
          annotations: []
        };
        
        setDocuments(prev => [newDocument, ...prev]);
        
        logDocumentActivity(data.id, 'upload', 'Uploaded new document');
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
    
    return activityRecord;
  };

  if (selectedCategory) {
    // For Company Documents, we need a different filter
    let categoryDocuments = documents;
    if (selectedCategory === "Company Documents") {
      categoryDocuments = documents.filter(doc => doc.companyId);
    } else {
      categoryDocuments = documents.filter(doc => doc.category === selectedCategory);
    }
    
    return (
      <DocumentCategoryView
        category={selectedCategory}
        documents={categoryDocuments}
        onBackClick={() => setSelectedCategory(null)}
        onUploadDocument={handleUploadDocument}
        onMarkAsReviewed={handleMarkAsReviewed}
        onAddComment={handleAddComment}
        onAddAnnotation={handleAddAnnotation}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onDownload={handleDownloadDocument}
        onView={handleViewDocument}
      />
    );
  }

  // Only show Company Documents category if user has a company
  const filteredCategories = user.companyId 
    ? DOCUMENT_CATEGORIES 
    : DOCUMENT_CATEGORIES.filter(cat => cat !== "Company Documents");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">Documents</h1>
        <p className="text-muted-foreground">
          Access and manage your documents by category
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map(category => (
          <DocumentCategoryCard
            key={category}
            title={category}
            description={CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || ''}
            count={getDocumentCountByCategory(category)}
            icon={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default Documents;
