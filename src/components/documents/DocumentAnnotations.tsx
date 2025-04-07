
import { useState, useRef, useEffect } from 'react';
import { Document, DocumentAnnotation } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { StickyNote, Plus, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentAnnotationsProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onAddAnnotation?: (annotation: DocumentAnnotation) => void;
  onDeleteAnnotation?: (id: string) => void;
}

export function DocumentAnnotations({ document, isOpen, onClose, onAddAnnotation, onDeleteAnnotation }: DocumentAnnotationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>(document.annotations || []);
  const [newAnnotation, setNewAnnotation] = useState<{content: string, position: {x: number, y: number}} | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update annotations when document changes
  useEffect(() => {
    setAnnotations(document.annotations || []);
  }, [document]);

  const handleAddAnnotation = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNewAnnotation({
      content: '',
      position: { x, y }
    });
  };

  const handleSaveAnnotation = () => {
    if (!user || !newAnnotation) return;
    
    const annotation: DocumentAnnotation = {
      id: uuidv4(),
      documentId: document.id,
      userId: user.id,
      userName: user.name,
      content: newAnnotation.content,
      position: newAnnotation.position,
      createdAt: new Date()
    };
    
    // Update local state
    setAnnotations([...annotations, annotation]);
    setNewAnnotation(null);
    
    // Call callback for parent component
    if (onAddAnnotation) {
      onAddAnnotation(annotation);
    }
    
    toast({
      title: 'Annotation added',
      description: 'Your annotation has been added to the document'
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    // Update local state
    setAnnotations(annotations.filter(a => a.id !== id));
    
    // Call callback for parent component
    if (onDeleteAnnotation) {
      onDeleteAnnotation(id);
    }
    
    toast({
      title: 'Annotation deleted',
      description: 'Your annotation has been removed'
    });
  };

  const renderPreview = () => {
    if (document.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden" ref={previewRef}>
          <img 
            src={document.url}
            alt={document.name}
            className="w-full h-full object-contain"
            onClick={handleAddAnnotation}
          />
          {annotations.map(annotation => (
            <div 
              key={annotation.id}
              className="absolute group"
              style={{ 
                left: `${annotation.position.x}%`, 
                top: `${annotation.position.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <div className="bg-yellow-200 p-2 rounded shadow-md max-w-[200px] group-hover:z-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">{annotation.userName}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 rounded-full" 
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs">{annotation.content}</p>
              </div>
            </div>
          ))}
          {newAnnotation && (
            <div 
              className="absolute z-50"
              style={{ 
                left: `${newAnnotation.position.x}%`, 
                top: `${newAnnotation.position.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <div className="bg-yellow-100 p-2 rounded shadow-md">
                <Textarea 
                  placeholder="Add your annotation..." 
                  className="min-h-[80px] text-xs mb-2"
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, content: e.target.value })}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewAnnotation(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveAnnotation}
                    disabled={!newAnnotation.content.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else if (document.type === 'application/pdf') {
      return (
        <div className="text-center p-4">
          <p>PDF preview with annotations is not available in this demo.</p>
          <p className="text-muted-foreground text-sm mt-2">Click the button below to add annotations manually.</p>
        </div>
      );
    } else {
      return (
        <div className="text-center p-4">
          <p>Preview not available for this file type.</p>
          <p className="text-muted-foreground text-sm mt-2">Click the button below to add annotations manually.</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Annotations</DialogTitle>
          <DialogDescription>
            Add and view annotations for "{document.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {renderPreview()}
          
          {!newAnnotation && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setNewAnnotation({ content: '', position: { x: 50, y: 50 } })}
            >
              <Plus className="h-4 w-4" />
              Add Annotation
            </Button>
          )}
          
          {annotations.length > 0 && (
            <div className="border rounded-md">
              <div className="p-3 border-b flex items-center gap-2 bg-muted/40">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">All Annotations ({annotations.length})</h4>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-4 space-y-3">
                  {annotations.map(annotation => (
                    <div key={annotation.id} className="bg-muted/30 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{annotation.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(annotation.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm">{annotation.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
