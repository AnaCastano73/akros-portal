
import React, { useState, useEffect } from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document';

interface DocumentWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const DocumentWidget: React.FC<DocumentWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
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
      // In a real implementation, you would fetch documents from your Supabase table
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('visible_to', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(widget.config?.count || 2);
        
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReviewed = async (id: string, reviewed: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({ reviewed })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => doc.id === id ? { ...doc, reviewed } : doc)
      );
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  if (isLoading) {
    return (
      <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-muted-foreground text-center mb-4">
            You don't have any documents available yet.
          </p>
          <Button 
            onClick={() => navigate('/documents')}
            className="bg-brand-500 hover:bg-brand-600"
          >
            View Documents
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {documents.map(document => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                onMarkAsReviewed={handleMarkAsReviewed}
              />
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => navigate('/documents')}
          >
            View All Documents
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};
