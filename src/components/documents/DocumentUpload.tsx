import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Cloud, File, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document as DocumentType } from '@/types/document';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface DocumentUploadProps {
  onUpload: (file: File, category: string, metadata?: Record<string, string>, tags?: string[], isNewVersion?: boolean, existingDocumentId?: string, versionNotes?: string) => void;
  existingDocuments?: DocumentType[];
  trigger?: React.ReactNode;
}

// Standard document categories
const DOCUMENT_CATEGORIES = [
  "Session Homework",
  "Client Materials", 
  "Meeting Notes",
  "Final Deliverables"
];

export function DocumentUpload({ onUpload, existingDocuments = [], trigger }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [useCloudStorage, setUseCloudStorage] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleAddMetadata = () => {
    if (!metadataKey.trim() || !metadataValue.trim()) return;
    
    setMetadata({
      ...metadata,
      [metadataKey.trim()]: metadataValue.trim()
    });
    
    setMetadataKey('');
    setMetadataValue('');
  };
  
  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file && !selectedDocument) {
      toast({
        title: 'Missing information',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    // If it's a new version of an existing document
    if (isNewVersion && selectedDocument) {
      if (!file) {
        toast({
          title: 'Missing file',
          description: 'Please select a file to upload as a new version',
          variant: 'destructive',
        });
        return;
      }
      
      onUpload(
        file, 
        selectedDocument.category, 
        metadata,
        tags.length > 0 ? tags : undefined,
        true,
        selectedDocument.id,
        versionNotes
      );
    } 
    // If it's a new document
    else if (file) {
      if (!category) {
        toast({
          title: 'Missing information',
          description: 'Please select a category',
          variant: 'destructive',
        });
        return;
      }
      
      onUpload(
        file, 
        category, 
        Object.keys(metadata).length > 0 ? metadata : undefined,
        tags.length > 0 ? tags : undefined
      );
    }
    
    // Reset form and close dialog
    setOpen(false);
    resetForm();
    
    toast({
      title: isNewVersion ? 'New version uploaded' : 'Document uploaded',
      description: `${file?.name} has been uploaded successfully.`,
    });
  };
  
  const resetForm = () => {
    setFile(null);
    setCategory('');
    setTags([]);
    setTagInput('');
    setMetadata({});
    setMetadataKey('');
    setMetadataValue('');
    setActiveTab('upload');
    setSearchTerm('');
    setSelectedDocument(null);
    setIsNewVersion(false);
    setVersionNotes('');
    setUseCloudStorage(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const filteredDocuments = existingDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-brand-500 hover:bg-brand-600">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document or a new version of an existing document
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload New</TabsTrigger>
              <TabsTrigger value="version" disabled={existingDocuments.length === 0}>
                Upload Version
              </TabsTrigger>
            </TabsList>
            
            {/* Upload new document tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">File</Label>
                  <FileUpload 
                    onChange={handleFileChange}
                    value={file}
                    accept="*/*"
                    maxSize={100} // 100MB
                    buttonText="Select file"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button 
                            type="button"
                            className="rounded-full h-3 w-3 inline-flex items-center justify-center hover:bg-muted ml-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <span className="sr-only">Remove</span>
                            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                              <path d="M1 9L9 1M1 1L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label>Metadata (Optional)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    <Input 
                      className="col-span-2"
                      value={metadataKey}
                      onChange={(e) => setMetadataKey(e.target.value)}
                      placeholder="Key"
                    />
                    <Input 
                      className="col-span-2"
                      value={metadataValue}
                      onChange={(e) => setMetadataValue(e.target.value)}
                      placeholder="Value"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleAddMetadata}
                      disabled={!metadataKey.trim() || !metadataValue.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {Object.keys(metadata).length > 0 && (
                    <div className="border rounded-md overflow-hidden mt-2">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2">Key</th>
                            <th className="text-left p-2">Value</th>
                            <th className="w-10 p-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(metadata).map(([key, value]) => (
                            <tr key={key} className="border-t">
                              <td className="p-2">{key}</td>
                              <td className="p-2">{value}</td>
                              <td className="p-2">
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7" 
                                  onClick={() => handleRemoveMetadata(key)}
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M1 9L9 1M1 1L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cloud-storage"
                    checked={useCloudStorage}
                    onCheckedChange={setUseCloudStorage}
                  />
                  <Label htmlFor="cloud-storage" className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                    Use cloud storage for large files
                  </Label>
                </div>
              </div>
            </TabsContent>
            
            {/* Upload new version tab */}
            <TabsContent value="version" className="space-y-4 mt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search existing documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted/40 py-2 px-3 border-b">
                  <h4 className="text-sm font-medium">Select a document</h4>
                </div>
                <div className="divide-y max-h-[200px] overflow-y-auto">
                  {filteredDocuments.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground">No documents found</p>
                  ) : (
                    filteredDocuments.map(doc => (
                      <button
                        key={doc.id}
                        type="button"
                        className={`w-full text-left p-3 flex items-start hover:bg-muted/30 ${selectedDocument?.id === doc.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <File className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {doc.category} • Last updated: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {selectedDocument && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="version-file">New Version File</Label>
                    <FileUpload 
                      onChange={handleFileChange}
                      value={file}
                      accept="*/*"
                      maxSize={100} // 100MB
                      buttonText="Select file"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="version-notes">Version Notes</Label>
                    <Textarea
                      id="version-notes"
                      placeholder="Describe what changed in this version..."
                      value={versionNotes}
                      onChange={(e) => setVersionNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cloud-storage-version"
                      checked={useCloudStorage}
                      onCheckedChange={setUseCloudStorage}
                    />
                    <Label htmlFor="cloud-storage-version" className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                      Use cloud storage for large files
                    </Label>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-500 hover:bg-brand-600"
              disabled={(activeTab === 'upload' && (!file || !category)) || (activeTab === 'version' && (!selectedDocument || !file))}
            >
              {activeTab === 'version' ? 'Upload New Version' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
