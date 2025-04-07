
import { useState } from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Upload } from 'lucide-react';

interface DocumentsListProps {
  documents: Document[];
  onMarkAsReviewed?: (id: string, reviewed: boolean) => void;
  onAddComment?: (id: string, comment: string) => void;
  onUploadClick?: () => void;
}

export function DocumentsList({ 
  documents, 
  onMarkAsReviewed,
  onAddComment,
  onUploadClick
}: DocumentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Extract all unique categories from documents
  const allCategories = Array.from(
    new Set(documents.map(doc => doc.category))
  );
  
  // Filter documents based on search term and selected category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start gap-4 justify-between">
        <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {onUploadClick && (
          <Button 
            className="w-full md:w-auto bg-brand-500 hover:bg-brand-600"
            onClick={onUploadClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Badge 
          variant={selectedCategory === 'all' ? "default" : "outline"} 
          onClick={() => setSelectedCategory('all')} 
          className={selectedCategory === 'all' ? "bg-brand-500 hover:bg-brand-600" : ""}
        >
          All
        </Badge>
        {allCategories.map(category => (
          <Badge 
            key={category} 
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-brand-500 hover:bg-brand-600" : ""}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No documents found. Try adjusting your filters or upload a new document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocuments.map(document => (
            <DocumentCard 
              key={document.id} 
              document={document}
              onMarkAsReviewed={onMarkAsReviewed}
              onAddComment={onAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
