
import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ isOpen, onClose }) => {
  const { createRoom, contacts } = useChat();
  const [roomName, setRoomName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room name',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one contact',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const room = await createRoom(roomName, selectedContacts);
      if (room) {
        setRoomName('');
        setSelectedContacts([]);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Contacts</Label>
            <ScrollArea className="h-60 border rounded-md">
              <div className="p-2 space-y-2">
                {contacts.length ? (
                  contacts.map(contact => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`contact-${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                      />
                      <Label htmlFor={`contact-${contact.id}`} className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        {contact.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    No contacts available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
