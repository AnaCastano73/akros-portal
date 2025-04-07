
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, MessageSquare, Upload, Check, X } from 'lucide-react';
import { DOCUMENTS, USERS } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useToast } from '@/components/ui/use-toast';
import { formatFileSize, v4 as uuidv4 } from '@/lib/utils';

const DocumentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Document Management - Healthwise Advisory Hub';
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
  const filteredDocuments = DOCUMENTS.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extract all unique categories from documents
  const allCategories = Array.from(
    new Set(DOCUMENTS.map(doc => doc.category))
  );

  const getUserName = (userId: string) => {
    const foundUser = USERS.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getVisibleToUsers = (userIds: string[]) => {
    return userIds.map(id => {
      const foundUser = USERS.find(u => u.id === id);
      return foundUser ? foundUser.name : 'Unknown User';
    }).join(', ');
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
      visibleTo: USERS.map(u => u.id), // Make visible to all users
      reviewed: false,
    };
    
    DOCUMENTS.push(newDocument);
    
    toast({
      title: 'Document uploaded',
      description: `${file.name} has been uploaded successfully and shared with all users.`,
    });
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
          categories={allCategories}
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
                      {new Date(doc.uploadedAt).toLocaleDateString()}
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
