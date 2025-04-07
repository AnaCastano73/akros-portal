
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Check, MessageSquare } from 'lucide-react';
import { Document } from '@/types/document';
import { formatFileSize } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface DocumentCardProps {
  document: Document;
  onMarkAsReviewed?: (id: string, reviewed: boolean) => void;
  onAddComment?: (id: string, comment: string) => void;
}

export function DocumentCard({ 
  document, 
  onMarkAsReviewed,
  onAddComment
}: DocumentCardProps) {
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { toast } = useToast();

  const handleMarkAsReviewed = () => {
    if (onMarkAsReviewed) {
      onMarkAsReviewed(document.id, !document.reviewed);
      toast({
        title: document.reviewed ? 'Document marked as unreviewed' : 'Document marked as reviewed',
        description: `${document.name} has been ${document.reviewed ? 'unmarked' : 'marked'} as reviewed.`,
      });
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(document.id, commentText);
      setCommentText('');
      setIsAddingComment(false);
      toast({
        title: 'Comment added',
        description: 'Your comment has been added to the document.',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-brand-100">
              <FileText className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <CardTitle className="text-base">{document.name}</CardTitle>
              <CardDescription>
                {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {document.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {isAddingComment ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Add your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingComment(false);
                  setCommentText('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-brand-500 hover:bg-brand-600"
              >
                Add Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {document.comments && document.comments.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto rounded-md bg-secondary/50 p-2">
                {document.comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <div className="font-medium">{comment.userName}</div>
                    <div className="text-muted-foreground">{comment.content}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingComment(!isAddingComment)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {isAddingComment ? 'Cancel' : 'Comment'}
          </Button>
          {onMarkAsReviewed && (
            <Button
              size="sm"
              variant={document.reviewed ? "default" : "outline"}
              className={document.reviewed ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={handleMarkAsReviewed}
            >
              <Check className="h-4 w-4 mr-1" />
              {document.reviewed ? 'Reviewed' : 'Mark as Reviewed'}
            </Button>
          )}
        </div>
        <Button size="sm" variant="outline" asChild>
          <a href={document.url} download={document.name}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
