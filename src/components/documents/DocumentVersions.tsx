
import { useState } from 'react';
import { DocumentVersion, Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatFileSize } from '@/lib/utils';
import { Download, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DocumentVersionsProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onRevertToVersion?: (version: DocumentVersion) => void;
}

export function DocumentVersions({ document, isOpen, onClose, onRevertToVersion }: DocumentVersionsProps) {
  const { toast } = useToast();
  const [revertingVersion, setRevertingVersion] = useState<string | null>(null);

  const handleRevertToVersion = (version: DocumentVersion) => {
    setRevertingVersion(version.id);
    
    // Simulate API call to revert to version
    setTimeout(() => {
      if (onRevertToVersion) {
        onRevertToVersion(version);
      }
      
      setRevertingVersion(null);
      toast({
        title: 'Version restored',
        description: `Document reverted to version ${version.version}`,
      });
    }, 1000);
  };

  // Sort versions by date (newest first)
  const sortedVersions = [...(document.versionHistory || [])].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and manage previous versions of "{document.name}"
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[350px] rounded-md border">
          {sortedVersions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No previous versions available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVersions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version}</TableCell>
                    <TableCell>{new Date(version.uploadedAt).toLocaleString()}</TableCell>
                    <TableCell>{formatFileSize(version.size)}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{version.changes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={version.url} download={`${document.name} (v${version.version})`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRevertToVersion(version)}
                          disabled={revertingVersion === version.id}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
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
