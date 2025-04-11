
import { FolderOpen } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentCategoryCardProps {
  title: string;
  description: string;
  count: number;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function DocumentCategoryCard({
  title,
  description,
  count,
  onClick,
  icon = <FolderOpen className="h-8 w-8 text-brand-500" />
}: DocumentCategoryCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-md bg-brand-50 mb-2">
            {icon}
          </div>
          <Badge variant="outline" className="ml-2">
            {count} {count === 1 ? 'document' : 'documents'}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t text-sm text-muted-foreground">
        Click to view documents
      </CardFooter>
    </Card>
  );
}
