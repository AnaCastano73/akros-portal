
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, MessageSquare, Upload, Check, X, FolderOpen, ChevronLeft, Users, FileText, FileImage, BookOpen, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentCategoryView } from '@/components/documents/DocumentCategoryView';
import { DocumentCategoryCard } from '@/components/documents/DocumentCategoryCard';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { Document } from '@/types/document';
import { User } from '@/types/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials", 
  "Meeting Notes",
  "Final Deliverables"
];

const CATEGORY_DESCRIPTIONS = {
  "Session Homework": "Assignments for clients to complete",
  "Client Materials": "Resources shared with clients",
  "Meeting Notes": "Notes and summaries from meetings",
  "Final Deliverables": "Final reports and completed materials"
};

const CATEGORY_ICONS = {
  "Session Homework": <BookOpen className="h-8 w-8 text-blue-500" />,
  "Client Materials": <FileText className="h-8 w-8 text-green-500" />,
  "Meeting Notes": <FileImage className="h-8 w-8 text-yellow-500" />,
  "Final Deliverables": <FileCheck className="h-8 w-8 text-purple-500" />
};

const DocumentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'byUser' | 'byCategory'>('all');

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
      
      const transformedDocs: Document[] = (data || []).map(doc => {
        return {
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
          metadata: doc.metadata,
          comments: [],
          annotations: []
        };
      });
      
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
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers((data?.users || []).map(u => ({
        id: u.id,
        name: `${u.user_metadata?.first_name || ''} ${u.user_metadata?.last_name || ''}`.trim() || 
              u.email?.split('@')[0] || 'Unknown User'
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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

  const getDocumentCountByCategory = (category: string): number => {
    return documents.filter(doc => doc.category === category).length;
  };

  const getDocumentCountByUser = (userId: string): number => {
    return documents.filter(doc => doc.uploadedBy === userId).length;
  };

  const getDocumentsForUser = (userId: string): Document[] => {
    return documents.filter(doc => 
      doc.uploadedBy === userId || doc.visibleTo.includes(userId)
    );
  };

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
      const fileName = `${Date.now()}_${file.name}`;
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        const { data: usersData } = await supabase.auth.admin.listUsers();
        
        if (!usersData) {
          throw new Error("Failed to fetch users");
        }
        
        const allUserIds = (usersData.users || []).map(u => u.id);
        
        const { data: docData, error } = await supabaseTyped
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
        
        const newDocument: Document = {
          id: docData.id,
          name: docData.name,
          url: docData.url,
          type: docData.type,
          size: docData.size,
          uploadedBy: docData.uploaded_by,
          uploadedAt: new Date(docData.uploaded_at),
          category: docData.category,
          visibleTo: docData.visible_to,
          reviewed: false,
          comments: [],
          annotations: [],
          tags: [],
          version: 1,
          metadata: docData.metadata
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
      
      toast({
        title: reviewed ? 'Document marked as reviewed' : 'Document marked as not reviewed',
        description: `The document status has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'An error occurred while updating the document',
        variant: 'destructive'
      });
    }
  };

  // View for category documents
  if (viewMode === 'byCategory' && selectedCategory) {
    const categoryDocuments = documents.filter(doc => doc.category === selectedCategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('all')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-heading">{selectedCategory} Documents</h1>
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
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded On</TableHead>
                    <TableHead>Visible To</TableHead>
                    <TableHead>Reviewed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryDocuments
                    .filter(doc => 
                      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      getUserName(doc.uploadedBy).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="font-medium">{doc.name}</div>
                      </TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsReviewed(doc.id, !doc.reviewed)}
                          >
                            {doc.reviewed ? 'Unmark' : 'Mark Reviewed'}
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
                  {categoryDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No documents found in this category.
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
  }

  // View for user documents
  if (viewMode === 'byUser' && selectedUser) {
    const userDocuments = getDocumentsForUser(selectedUser.id);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('all')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            Documents for {selectedUser.name}
          </h1>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            {DOCUMENT_CATEGORIES.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>All Documents</CardTitle>
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
                        <TableHead>Category</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded On</TableHead>
                        <TableHead>Reviewed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userDocuments
                        .filter(doc => 
                          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="font-medium">{doc.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.category}</Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(doc.size)}</TableCell>
                          <TableCell>
                            {doc.uploadedAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {doc.reviewed ? 
                              <Check className="h-4 w-4 text-green-500" /> : 
                              <X className="h-4 w-4 text-gray-300" />
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMarkAsReviewed(doc.id, !doc.reviewed)}
                              >
                                {doc.reviewed ? 'Unmark' : 'Mark Reviewed'}
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
                      {userDocuments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            No documents found for this user.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {DOCUMENT_CATEGORIES.map(category => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{category} Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded On</TableHead>
                          <TableHead>Reviewed</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDocuments
                          .filter(doc => doc.category === category)
                          .map(doc => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="font-medium">{doc.name}</div>
                            </TableCell>
                            <TableCell>{formatFileSize(doc.size)}</TableCell>
                            <TableCell>
                              {doc.uploadedAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {doc.reviewed ? 
                                <Check className="h-4 w-4 text-green-500" /> : 
                                <X className="h-4 w-4 text-gray-300" />
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsReviewed(doc.id, !doc.reviewed)}
                                >
                                  {doc.reviewed ? 'Unmark' : 'Mark Reviewed'}
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
                        {userDocuments.filter(doc => doc.category === category).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              No {category} documents found for this user.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Main dashboard view with categories and users
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
      
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="users">By User</TabsTrigger>
          <TabsTrigger value="all">All Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DOCUMENT_CATEGORIES.map(category => (
              <DocumentCategoryCard
                key={category}
                title={category}
                description={CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || ''}
                count={getDocumentCountByCategory(category)}
                icon={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                onClick={() => {
                  setSelectedCategory(category);
                  setViewMode('byCategory');
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
                getDocumentCountByUser(user.id) > 0
              )
              .map(user => (
                <Card 
                  key={user.id} 
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedUser({
                      id: user.id,
                      name: user.name,
                      email: '', // We don't have email in this context
                      role: 'client' // Default role assumption
                    });
                    setViewMode('byUser');
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-md bg-blue-50 mb-2">
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {getDocumentCountByUser(user.id)} {getDocumentCountByUser(user.id) === 1 ? 'document' : 'documents'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      View and manage documents for this user
                    </p>
                  </CardContent>
                </Card>
              ))}
              
            {users.filter(user => 
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
              getDocumentCountByUser(user.id) > 0
            ).length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">
                  No users found matching your search, or no users have documents.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Documents</CardTitle>
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
                      <TableHead>Reviewed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents
                      .filter(doc => 
                        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        getUserName(doc.uploadedBy).toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(doc => (
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
                        <TableCell>
                          {doc.reviewed ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-gray-300" />
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkAsReviewed(doc.id, !doc.reviewed)}
                            >
                              {doc.reviewed ? 'Unmark' : 'Mark Reviewed'}
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
                    {documents.filter(doc => 
                      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      getUserName(doc.uploadedBy).toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No documents found. Try adjusting your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManagement;
