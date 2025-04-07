
import { DocumentActivity as ActivityType } from '@/types/document';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Edit, Trash, MessageSquare, StickyNote, History } from 'lucide-react';

const activityIcons = {
  'upload': <FileText className="h-4 w-4" />,
  'download': <Download className="h-4 w-4" />,
  'view': <Eye className="h-4 w-4" />,
  'update': <Edit className="h-4 w-4" />,
  'delete': <Trash className="h-4 w-4" />,
  'comment': <MessageSquare className="h-4 w-4" />,
  'annotate': <StickyNote className="h-4 w-4" />,
  'version': <History className="h-4 w-4" />
};

const activityDescriptions = {
  'upload': 'Uploaded document',
  'download': 'Downloaded document',
  'view': 'Viewed document',
  'update': 'Updated document',
  'delete': 'Deleted document',
  'comment': 'Added comment',
  'annotate': 'Added annotation',
  'version': 'Created new version'
};

interface DocumentActivityProps {
  documentId: string;
  activities: ActivityType[];
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentActivity({ documentId, activities, isOpen, onClose }: DocumentActivityProps) {
  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Document Activity</DialogTitle>
          <DialogDescription>
            View all activity and audit trail for this document
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] rounded-md border">
          {sortedActivities.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No activity has been recorded for this document yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {activityIcons[activity.activity]}
                        </span>
                        <span>{activityDescriptions[activity.activity]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{activity.userName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {activity.details || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
