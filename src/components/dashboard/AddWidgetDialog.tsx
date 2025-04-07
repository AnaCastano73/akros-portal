
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Book, 
  FileText, 
  BarChart, 
  Activity, 
  Bell, 
  Code
} from 'lucide-react';

interface AddWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onAddWidget: (type: string, title: string) => void;
}

const widgetTypes = [
  { id: 'courses', name: 'Courses', icon: Book, description: 'Display recent or featured courses' },
  { id: 'documents', name: 'Documents', icon: FileText, description: 'Show important documents' },
  { id: 'stats', name: 'Statistics', icon: BarChart, description: 'Key metrics and statistics' },
  { id: 'progress', name: 'Progress', icon: Activity, description: 'Learning progress and achievements' },
  { id: 'announcements', name: 'Announcements', icon: Bell, description: 'Important announcements and updates' },
  { id: 'custom', name: 'Custom', icon: Code, description: 'Custom HTML content' },
];

export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({
  open,
  onClose,
  onAddWidget,
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');

  const handleAddWidget = () => {
    if (selectedType && title) {
      onAddWidget(selectedType, title);
      onClose();
      
      // Reset form
      setSelectedType('');
      setTitle('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="widget-type">Widget Type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger id="widget-type">
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                {widgetTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <type.icon className="mr-2 h-4 w-4" />
                      <span>{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-sm text-muted-foreground">
                {widgetTypes.find(t => t.id === selectedType)?.description}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddWidget} disabled={!selectedType || !title}>
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
