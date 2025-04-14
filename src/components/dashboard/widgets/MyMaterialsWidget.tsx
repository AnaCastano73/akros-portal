
import React, { useState, useEffect } from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDocumentsForUser } from '@/services/dataService';

interface MyMaterialsWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const MyMaterialsWidget: React.FC<MyMaterialsWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documentsCount, setDocumentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const docs = await getDocumentsForUser(user.id);
      setDocumentsCount(docs.length);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4 p-4 bg-amber-100 text-amber-700 rounded-full">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Materials</h3>
        <p className="text-muted-foreground mb-4">
          {isLoading 
            ? 'Loading your materials...' 
            : documentsCount > 0 
              ? `You have ${documentsCount} document${documentsCount !== 1 ? 's' : ''} available.`
              : 'Access all the materials shared with you.'}
        </p>
        <Button 
          onClick={() => navigate('/documents')} 
          className="w-full bg-brand-500 hover:bg-brand-600"
        >
          View My Materials
        </Button>
      </div>
    </DashboardWidget>
  );
};
