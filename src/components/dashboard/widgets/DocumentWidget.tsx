
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { getDocumentsForUser, DOCUMENTS } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DocumentWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const DocumentWidget: React.FC<DocumentWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Get user documents
  const userDocuments = getDocumentsForUser(user.id);
  
  // Get recent documents
  const displayCount = widget.config?.count || 2;
  const recentDocuments = userDocuments.slice(0, displayCount);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {recentDocuments.length === 0 ? (
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
            {recentDocuments.map(document => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                onMarkAsReviewed={(id, reviewed) => {
                  const doc = DOCUMENTS.find(d => d.id === id);
                  if (doc) {
                    doc.reviewed = reviewed;
                  }
                }}
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
