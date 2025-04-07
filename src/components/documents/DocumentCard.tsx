
import { useState } from 'react';
import { Document as DocumentType, DocumentAnnotation, DocumentVersion, DocumentActivity, FILE_PREVIEW_TYPES } from '@/types/document';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Check, 
  MessageSquare, 
  Clock, 
  Tag, 
  History,
  StickyNote,
  Eye,
  MoreHorizontal,
  ClipboardList
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { formatFileSize } from '@/lib/utils';
import { DocumentVersions } from './DocumentVersions';
import { DocumentAnnotations } from './DocumentAnnotations';
import { DocumentActivity } from './DocumentActivity';
import { useToast } from '@/components/ui/use-toast';

interface DocumentCardProps {
  document: DocumentType;
  onMarkAsReviewed?: (id: string, reviewed: boolean) => void;
  onAddComment?: (id: string, comment: string) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onAddAnnotation?: (annotation: DocumentAnnotation) => void;
  onAddVersion?: (version: DocumentVersion) => void;
  onRevertToVersion?: (documentId: string, versionId: string) => void;
  onDownload?: (documentId: string) => void;
  onView?: (documentId: string) => void;
}

export function DocumentCard({ 
  document, 
  onMarkAsReviewed, 
  onAddComment,
  onAddTag,
  onRemoveTag,
  onAddAnnotation,
  onAddVersion,
  onRevertToVersion,
  onDownload,
  onView
}: DocumentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeDismissible, setActiveDismissible] = useState<'versions' | 'annotations' | 'activity' | null>(null);
  
  if (!user) return null;

  // Check if this document has preview support
  const hasPreviewSupport = FILE_PREVIEW_TYPES.includes(document.type);
  
  // Mock document activity data
  const mockActivities: DocumentActivity[] = [
    {
      id: '1',
      documentId: document.id,
      userId: document.uploadedBy,
      userName: 'Admin User',
      activity: 'upload',
      details: 'Initial upload',
      timestamp: document.uploadedAt
    },
    {
      id: '2',
      documentId: document.id,
      userId: user.id,
      userName: user.name,
      activity: 'view',
      timestamp: new Date(document.uploadedAt.getTime() + 3600000)
    }
  ];
  
  // Add sample version history if none exists
  if (!document.versionHistory) {
    document.versionHistory = [
      {
        id: '1',
        documentId: document.id,
        version: 1,
        url: document.url,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        changes: 'Initial version',
        size: document.size
      }
    ];
  }
  
  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    
    if (onAddComment) {
      onAddComment(document.id, comment);
    }
    
    setComment('');
    setShowCommentForm(false);
    
    toast({
      title: 'Comment added',
      description: 'Your comment has been added to the document'
    });
  };
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (onAddTag) {
      onAddTag(document.id, newTag);
    }
    
    // If no callback is provided, update the document directly
    if (!onAddTag && !document.tags) {
      document.tags = [];
    }
    
    if (!onAddTag) {
      document.tags?.push(newTag);
    }
    
    setNewTag('');
    setShowTagForm(false);
    
    toast({
      title: 'Tag added',
      description: `Tag "${newTag}" has been added to the document`
    });
  };
  
  const handleRemoveTag = (tag: string) => {
    if (onRemoveTag) {
      onRemoveTag(document.id, tag);
    }
    
    // If no callback is provided, update the document directly
    if (!onRemoveTag && document.tags) {
      document.tags = document.tags.filter(t => t !== tag);
    }
    
    toast({
      title: 'Tag removed',
      description: `Tag "${tag}" has been removed from the document`
    });
  };
  
  const handleAddAnnotation = (annotation: DocumentAnnotation) => {
    if (onAddAnnotation) {
      onAddAnnotation(annotation);
    }
    
    // If no callback is provided, update the document directly
    if (!onAddAnnotation) {
      if (!document.annotations) {
        document.annotations = [];
      }
      document.annotations.push(annotation);
    }
  };
  
  const handleDownload = () => {
    // Record the download activity
    if (onDownload) {
      onDownload(document.id);
    }
    
    // Update last viewed time
    document.lastViewedAt = new Date();
  };
  
  const handleViewDocument = () => {
    // Record the view activity
    if (onView) {
      onView(document.id);
    }
    
    // Update last viewed time
    document.lastViewedAt = new Date();
    
    window.open(document.url, '_blank');
  };
  
  const handleRevertToVersion = (version: DocumentVersion) => {
    if (onRevertToVersion) {
      onRevertToVersion(document.id, version.id);
    }
    
    // Close the versions dialog
    setActiveDismissible(null);
  };

  const getFileIcon = () => {
    if (document.type.startsWith('image/')) {
      return (
        <div className="bg-muted rounded-md overflow-hidden h-12 w-12 flex items-center justify-center">
          <img 
            src={document.url} 
            alt={document.name} 
            className="object-cover h-full w-full"
          />
        </div>
      );
    }
    
    return (
      <div className="bg-muted rounded-md h-12 w-12 flex items-center justify-center">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            {getFileIcon()}
            <div>
              <CardTitle className="text-base">{document.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {document.category}
                </Badge>
                {document.tags && document.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button 
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
                {showTagForm && (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="border rounded px-1 py-0.5 text-xs w-20"
                      placeholder="Add tag"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-5 w-5" 
                      onClick={handleAddTag}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveDismissible('versions')}>
                <History className="h-4 w-4 mr-2" /> Version History
              </DropdownMenuItem>
              {hasPreviewSupport && (
                <DropdownMenuItem onClick={() => setActiveDismissible('annotations')}>
                  <StickyNote className="h-4 w-4 mr-2" /> Annotations
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setActiveDismissible('activity')}>
                <ClipboardList className="h-4 w-4 mr-2" /> Activity Log
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowTagForm(true)}>
                <Tag className="h-4 w-4 mr-2" /> Add Tag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCommentForm(true)}>
                <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {hasPreviewSupport && (
                <DropdownMenuItem onClick={handleViewDocument}>
                  <Eye className="h-4 w-4 mr-2" /> View Document
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDownload} asChild>
                <a href={document.url} download={document.name}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </a>
              </DropdownMenuItem>
              {onMarkAsReviewed && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onMarkAsReviewed(document.id, !document.reviewed)}>
                    <Check className="h-4 w-4 mr-2" /> {document.reviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(document.size)}
            </span>
            {document.reviewed && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <Check className="h-3 w-3 mr-1" /> Reviewed
              </Badge>
            )}
          </div>
        </div>
        
        {showCommentForm && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Add your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCommentForm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
              >
                Add Comment
              </Button>
            </div>
          </div>
        )}
        
        {document.comments && document.comments.length > 0 && (
          <div className="mt-3 border-t pt-3 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({document.comments.length})
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {document.comments.map(comment => (
                <div key={comment.id} className="bg-muted/50 rounded-md p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex justify-between border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={() => setActiveDismissible('annotations')}
        >
          <StickyNote className="h-3.5 w-3.5" />
          <span>{document.annotations ? document.annotations.length : 0}</span>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            onClick={() => setShowCommentForm(true)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Comment
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            asChild
            onClick={handleDownload}
          >
            <a href={document.url} download={document.name}>
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      </CardFooter>
      
      {/* Version history dialog */}
      <DocumentVersions 
        document={document}
        isOpen={activeDismissible === 'versions'}
        onClose={() => setActiveDismissible(null)}
        onRevertToVersion={handleRevertToVersion}
      />
      
      {/* Annotations dialog */}
      <DocumentAnnotations 
        document={document}
        isOpen={activeDismissible === 'annotations'}
        onClose={() => setActiveDismissible(null)}
        onAddAnnotation={handleAddAnnotation}
      />
      
      {/* Activity log dialog */}
      <DocumentActivity 
        documentId={document.id}
        activities={mockActivities}
        isOpen={activeDismissible === 'activity'}
        onClose={() => setActiveDismissible(null)}
      />
    </Card>
  );
}
