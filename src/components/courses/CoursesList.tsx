
import { useState } from 'react';
import { EnrollableCourseCard } from './EnrollableCourseCard';
import { Input } from '@/components/ui/input';
import { Course, CourseProgress } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CoursesListProps {
  courses: Course[];
  progress?: CourseProgress[];
}

export function CoursesList({ courses, progress = [] }: CoursesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Extract all unique tags from courses
  const allTags = Array.from(
    new Set(courses.flatMap(course => course.tags))
  );
  
  // Filter courses based on search term and selected tags
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => course.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Calculate progress percentage for each course
  const getProgressPercentage = (courseId: string): number => {
    const courseProgress = progress.find(p => p.courseId === courseId);
    if (!courseProgress) return 0;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    );
    
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={selectedTags.includes(tag) ? "bg-brand-500 hover:bg-brand-600" : ""}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTags([])}
              className="text-sm"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No courses found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <EnrollableCourseCard 
              key={course.id} 
              course={course} 
              progress={getProgressPercentage(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
