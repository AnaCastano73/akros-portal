
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export function CourseCard({ course, progress = 0 }: CourseCardProps) {
  const navigate = useNavigate();
  
  // Calculate total lessons
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length, 
    0
  );

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        <img
          src={course.thumbnailUrl || '/placeholder.svg'}
          alt={course.title}
          className="object-cover w-full h-full"
        />
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-brand-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <div className="flex flex-wrap gap-1 mt-2">
          {course.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-brand-100 text-brand-800 hover:bg-brand-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="mt-2 text-sm text-muted-foreground">
          {course.modules.length} modules • {totalLessons} lessons
        </div>
        {progress > 0 && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-brand-600">{progress}% complete</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-brand-500 hover:bg-brand-600"
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          {progress > 0 ? 'Continue Learning' : 'Start Course'}
        </Button>
      </CardFooter>
    </Card>
  );
}
