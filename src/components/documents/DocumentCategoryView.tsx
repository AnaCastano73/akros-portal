
import { useState, useEffect } from 'react';
import { ChevronLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Document, DocumentAnnotation } from '@/types/document';
import { useToast } from '@/hooks/use-toast';

interface DocumentCategoryViewProps {
  category: string;
  documents: Document[];
  onBackClick: () => void;
  onUploadDocument: (file: File, category: string) => Promise<void>;
  onMarkAsReviewed?: (id: string, reviewed: boolean) => void;
  onAddComment?: (id: string, comment: string) => void;
  onAddAnnotation?: (annotation: DocumentAnnotation) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
  isLoading?: boolean;
}

export function DocumentCategoryView({
  category,
  documents,
  onBackClick,
  onUploadDocument,
  onMarkAsReviewed,
  onAddComment,
  onAddAnnotation,
  onAddTag,
  onRemoveTag,
  onDownload,
  onView,
  isLoading = false
}: DocumentCategoryViewProps) {
  const { toast } = useToast();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Filter documents by the selected category
    setFilteredDocuments(documents.filter(doc => doc.category === category));
  }, [documents, category]);

  const handleUpload = async (file: File, documentCategory: string) => {
    try {
      setIsUploading(true);
      await onUploadDocument(file, documentCategory);
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded to ${category}`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onBackClick}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
        </div>
        
        <DocumentUpload 
          onUpload={(file) => handleUpload(file, category)}
          trigger={
            <Button className="bg-brand-500 hover:bg-brand-600" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to {category}
                </>
              )}
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span className="ml-2">Loading documents...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md">
          <p className="text-muted-foreground">No documents found in this category</p>
          <p className="text-sm mt-2 text-muted-foreground">Click the upload button to add a document</p>
        </div>
      ) : (
        <DocumentsList
          documents={filteredDocuments}
          onMarkAsReviewed={onMarkAsReviewed}
          onAddComment={onAddComment}
          onAddAnnotation={onAddAnnotation}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onDownload={onDownload}
          onView={onView}
        />
      )}
    </div>
  );
}
