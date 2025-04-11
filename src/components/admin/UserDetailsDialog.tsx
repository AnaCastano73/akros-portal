import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Document } from '@/types/document';
import { User, UserRole } from '@/types/auth';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { FilePlus, Users, UserIcon, Building } from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { getDocumentsForUser } from '@/services/dataService';
import { UserRoleManager } from '@/components/admin/UserRoleManager';
import { getAllCompanies, assignUserToCompany } from '@/services/companyService';
import { Company } from '@/types/company';

const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials", 
  "Meeting Notes",
  "Final Deliverables"
];

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
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isAssigningCompany, setIsAssigningCompany] = useState(false);
  
  useEffect(() => {
    if (isOpen && user) {
      fetchUserDocuments();
      fetchCompanies();
      
      if (user.companyId) {
        setSelectedCompanyId(user.companyId);
      }
    }
  }, [isOpen, user]);
  
  const fetchUserDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const documents = await getDocumentsForUser(user.id);
      setUserDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCompanies = async () => {
    try {
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };
  
  const handleUploadDocument = async () => {
    if (!user || !documentFile || !documentCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const fileName = `${Date.now()}_${documentFile.name}`;
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        const { data, error } = await supabaseTyped.from('documents').insert({
          name: documentName || documentFile.name,
          url: fileUrl,
          type: documentFile.type,
          size: documentFile.size,
          uploaded_by: 'admin',
          category: documentCategory,
          visible_to: [user.id],
        }).select().single();
        
        if (error) {
          throw error;
        }
        
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
          reviewed: data.reviewed || false,
          comments: [],
          annotations: [],
          tags: [],
          version: 1,
          metadata: {}
        };
        
        setUserDocuments(prev => [...prev, newDocument]);
        
        toast({
          title: "Document uploaded",
          description: `Document has been uploaded and shared with ${user.name}`
        });
        
        setDocumentFile(null);
        setDocumentName('');
      };
      
      reader.readAsDataURL(documentFile);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsReviewed = async (documentId: string, reviewed: boolean) => {
    try {
      const { error } = await supabaseTyped
        .from('documents')
        .update({ reviewed })
        .eq('id', documentId);
        
      if (error) throw error;
      
      setUserDocuments(prevDocs => 
        prevDocs.map(doc => doc.id === documentId ? { ...doc, reviewed } : doc)
      );
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Update failed",
        description: "Failed to update document status",
        variant: "destructive"
      });
    }
  };
  
  const handleAddComment = async (documentId: string, comment: string) => {
    try {
      const document = userDocuments.find(doc => doc.id === documentId);
      if (!document) return;
      
      const newComment = {
        id: uuidv4(),
        userId: 'admin',
        userName: 'Admin',
        content: comment,
        createdAt: new Date()
      };
      
      setUserDocuments(prevDocs => 
        prevDocs.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              comments: [...(doc.comments || []), newComment]
            };
          }
          return doc;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const handleRoleChange = (newRole: UserRole) => {
    if (currentUser) {
      setCurrentUser(prevUser => prevUser ? { ...prevUser, role: newRole } : null);
    }
  };
  
  const handleAssignCompany = async () => {
    if (!user || !selectedCompanyId) return;
    
    setIsAssigningCompany(true);
    try {
      const success = await assignUserToCompany(user.id, selectedCompanyId);
      if (success) {
        const company = companies.find(c => c.id === selectedCompanyId);
        if (currentUser && company) {
          setCurrentUser({
            ...currentUser,
            companyId: company.id,
            companyName: company.name
          });
        }
        
        toast({
          title: 'Success',
          description: `User assigned to company successfully`,
        });
      } else {
        throw new Error('Failed to assign user to company');
      }
    } catch (error: any) {
      console.error('Error assigning company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign user to company',
        variant: 'destructive',
      });
    } finally {
      setIsAssigningCompany(false);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">User Roles</h3>
              <UserRoleManager 
                userId={user.id} 
                currentRole={user.role}
                onRoleChange={handleRoleChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="company" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Company Assignment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Assigned Company</Label>
                  <div className="flex gap-2 mt-1">
                    <Select 
                      value={selectedCompanyId} 
                      onValueChange={setSelectedCompanyId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- No Company --</SelectItem>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleAssignCompany} 
                      disabled={isAssigningCompany || selectedCompanyId === user?.companyId}
                    >
                      {isAssigningCompany ? "Saving..." : "Assign"}
                    </Button>
                  </div>
                </div>
                
                {user?.companyId && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Currently assigned to: <strong>{user.companyName}</strong>
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  <p>Assigning a user to a company will allow them to view all company documents.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
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
                          {DOCUMENT_CATEGORIES.map(category => (
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
                  disabled={!documentFile || !documentCategory || isLoading}
                  className="bg-brand-500 hover:bg-brand-600 w-full md:w-auto"
                >
                  {isLoading ? 'Uploading...' : `Upload Document for ${user.name}`}
                </Button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium">User Documents</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="border rounded-md p-4 h-36"></div>
                ))}
              </div>
            ) : userDocuments.length > 0 ? (
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
