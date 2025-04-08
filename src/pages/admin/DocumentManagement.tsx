
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, MessageSquare, Upload, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useToast } from '@/components/ui/use-toast';
import { formatFileSize } from '@/lib/utils';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { Document } from '@/types/document';

// Standard document categories
const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials",
  "Meeting Notes",
  "Final Deliverables"
];

const DocumentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    document.title = 'Document Management - Akros Advisory';
    
    if (user?.role === 'admin') {
      Promise.all([fetchDocuments(), fetchUsers()]);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseTyped
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform to match Document type
      const transformedDocs: Document[] = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        size: doc.size,
        uploadedBy: doc.uploaded_by,
        uploadedAt: new Date(doc.uploaded_at),
        category: doc.category,
        visibleTo: doc.visible_to,
        reviewed: doc.reviewed || false,
        version: doc.version || 1,
        tags: doc.tags || [],
        metadata: doc.metadata || {},
        comments: [],
        annotations: []
      }));
      
      setDocuments(transformedDocs);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data: { users: userData }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers(userData.map(u => ({
        id: u.id,
        name: `${u.user_metadata?.first_name || ''} ${u.user_metadata?.last_name || ''}`.trim() || 
              u.email?.split('@')[0] || 'Unknown User'
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="bg-gray-200 h-96 rounded-md w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getVisibleToUsers = (userIds: string[]) => {
    return userIds.map(id => {
      const foundUser = users.find(u => u.id === id);
      return foundUser ? foundUser.name : 'Unknown User';
    }).join(', ');
  };

  const handleUploadDocument = async (file: File, category: string) => {
    try {
      // Generate a unique file name
      const fileName = `${Date.now()}_${file.name}`;
      
      // In a production app, you would upload to Storage
      // For this example, we'll use a data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        // Create document record visible to all users
        const { data: { users: allUsers }, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) throw usersError;
        
        const allUserIds = allUsers.map(u => u.id);
        
        const { data, error } = await supabaseTyped
          .from('documents')
          .insert({
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size,
            uploaded_by: user.id,
            category,
            visible_to: allUserIds
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
          comments: [],
          annotations: [],
          tags: [],
          version: 1,
          metadata: {}
        };
        
        setDocuments([newDocument, ...documents]);
        
        toast({
          title: 'Document uploaded',
          description: `${file.name} has been uploaded successfully and shared with all users.`,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Document Management</h1>
          <p className="text-muted-foreground">
            Manage and share documents with users
          </p>
        </div>
        <DocumentUpload 
          onUpload={handleUploadDocument}
          trigger={
            <Button className="bg-brand-500 hover:bg-brand-600">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          }
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Documents</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead>Visible To</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.name}</div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{getUserName(doc.uploadedBy)}</TableCell>
                    <TableCell>
                      {doc.uploadedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={getVisibleToUsers(doc.visibleTo)}>
                      {getVisibleToUsers(doc.visibleTo)}
                    </TableCell>
                    <TableCell>
                      {doc.reviewed ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-gray-300" />
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.url} download={doc.name}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No documents found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagement;
