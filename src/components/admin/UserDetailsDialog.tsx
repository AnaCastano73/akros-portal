
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Document as DocumentType } from '@/types/document';
import { User } from '@/types/auth';
import { DOCUMENTS } from '@/services/mockData';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from '@/lib/utils';
import { FilePlus, Users } from 'lucide-react';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailsDialog({ isOpen, onOpenChange, user }: UserDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('documents');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('');
  const [documentName, setDocumentName] = useState('');
  
  // Get all document categories
  const categories = Array.from(new Set(DOCUMENTS.map(doc => doc.category)));
  
  // Get documents for this user
  const userDocuments = DOCUMENTS.filter(doc => 
    doc.visibleTo.includes(user?.id || '') || doc.uploadedBy === user?.id
  );
  
  const handleUploadDocument = () => {
    if (!user || !documentFile || !documentCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new document
    const newDocument: DocumentType = {
      id: uuidv4(),
      name: documentName || documentFile.name,
      url: URL.createObjectURL(documentFile),
      type: documentFile.type,
      size: documentFile.size,
      uploadedBy: 'admin', // Current admin user ID would be used here in a real app
      uploadedAt: new Date(),
      category: documentCategory,
      visibleTo: [user.id], // Only visible to this specific user
      reviewed: false
    };
    
    // Add to documents
    DOCUMENTS.push(newDocument);
    
    toast({
      title: "Document uploaded",
      description: `Document has been uploaded and shared with ${user.name}`
    });
    
    // Reset form
    setDocumentFile(null);
    setDocumentName('');
  };
  
  const handleMarkAsReviewed = (documentId: string, reviewed: boolean) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document) {
      document.reviewed = reviewed;
    }
  };
  
  const handleAddComment = (documentId: string, comment: string) => {
    const document = DOCUMENTS.find(doc => doc.id === documentId);
    if (document && user) {
      if (!document.comments) {
        document.comments = [];
      }
      
      document.comments.push({
        id: uuidv4(),
        userId: 'admin', // Current admin user ID would be used here in a real app
        userName: 'Admin', // Current admin name would be used here in a real app
        content: comment,
        createdAt: new Date()
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200">
              <img 
                src={user.avatar || '/placeholder.svg'} 
                alt={user.name} 
                className="h-full w-full rounded-full object-cover" 
              />
            </div>
            <span>{user.name}</span>
          </DialogTitle>
          <DialogDescription>
            {user.email} • {user.role}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enrolled Courses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="border rounded-md p-4 bg-muted/40">
              <h3 className="text-sm font-medium mb-3">Upload Document for {user.name}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <FileUpload
                      onChange={setDocumentFile}
                      value={documentFile}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      maxSize={10}
                      buttonText="Select document"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Input
                        placeholder="Document name (optional)"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Select value={documentCategory} onValueChange={setDocumentCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleUploadDocument} 
                  disabled={!documentFile || !documentCategory}
                  className="bg-brand-500 hover:bg-brand-600 w-full md:w-auto"
                >
                  Upload Document for {user.name}
                </Button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium">User Documents</h3>
            {userDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userDocuments.map(document => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onMarkAsReviewed={handleMarkAsReviewed}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md border-dashed">
                <p className="text-muted-foreground">No documents available for this user</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="courses" className="mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Course enrollment management coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
