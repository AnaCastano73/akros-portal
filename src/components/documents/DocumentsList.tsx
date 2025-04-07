
import { useState } from 'react';
import { Document, DocumentAnnotation } from '@/types/document';
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
import { Search, Upload, Tag, Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';

interface DocumentsListProps {
  documents: Document[];
  onMarkAsReviewed?: (id: string, reviewed: boolean) => void;
  onAddComment?: (id: string, comment: string) => void;
  onAddAnnotation?: (annotation: DocumentAnnotation) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onUploadClick?: () => void;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
}

export function DocumentsList({ 
  documents, 
  onMarkAsReviewed,
  onAddComment,
  onAddAnnotation,
  onAddTag,
  onRemoveTag,
  onUploadClick,
  onDownload,
  onView
}: DocumentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showReviewedOnly, setShowReviewedOnly] = useState(false);
  
  // Extract all unique categories from documents
  const allCategories = Array.from(
    new Set(documents.map(doc => doc.category))
  );
  
  // Extract all unique tags from documents
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags || []))
  );
  
  // Filter documents based on search term, selected category, and selected tags
  let filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || doc.category === selectedCategory;
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => doc.tags?.includes(tag));
    
    const matchesReviewed =
      !showReviewedOnly || doc.reviewed;
    
    return matchesSearch && matchesCategory && matchesTags && matchesReviewed;
  });
  
  // Sort documents
  filteredDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortBy === 'size') {
      return sortDirection === 'asc'
        ? a.size - b.size
        : b.size - a.size;
    }
    
    return 0;
  });
  
  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTags([]);
    setShowReviewedOnly(false);
  };

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
          
          <div className="flex gap-2">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuCheckboxItem
                  checked={showReviewedOnly}
                  onCheckedChange={setShowReviewedOnly}
                >
                  Reviewed only
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  <div className="flex items-center justify-between w-full">
                    Date
                    {sortBy === 'date' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  <div className="flex items-center justify-between w-full">
                    Name
                    {sortBy === 'name' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  <div className="flex items-center justify-between w-full">
                    Size
                    {sortBy === 'size' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
                
                {(selectedCategory !== 'all' || selectedTags.length > 0 || showReviewedOnly) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleResetFilters}>
                      Reset all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {allTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="hidden sm:inline">Tags</span>
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedTags.length}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTagSelection(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                  
                  {selectedTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedTags([])}>
                        Clear tag filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
          className={`cursor-pointer ${selectedCategory === 'all' ? "bg-brand-500 hover:bg-brand-600" : ""}`}
        >
          All
        </Badge>
        {allCategories.map(category => (
          <Badge 
            key={category} 
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={`cursor-pointer ${selectedCategory === category ? "bg-brand-500 hover:bg-brand-600" : ""}`}
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
              onAddAnnotation={onAddAnnotation}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onDownload={onDownload ? () => onDownload(document.id) : undefined}
              onView={onView ? () => onView(document.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
