import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { COURSES } from "@/services/mockData";
import { v4 as uuidv4 } from "uuid";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  X, Plus, FileText, Image, Video, BookOpen, 
  Link, Upload, Youtube, File, FileImage, FileVideo 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Custom Components
import { FileUpload } from "@/components/ui/file-upload";
import { QuizBuilder, QuizQuestion } from "@/components/admin/QuizBuilder";

// Types
import { Course, Module, Lesson, Resource } from "@/types/course";

const courseFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  tags: z.array(z.string()).min(1, { message: "Add at least one tag" }),
  thumbnailUrl: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

type Step = "basic" | "modules" | "review";

type ContentType = "text" | "video" | "pdf" | "image" | "article" | "quiz";

interface CreateCourseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editCourse?: Course | null;
}

export function CreateCourseDialog({ isOpen, onOpenChange, editCourse = null }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [contentType, setContentType] = useState<ContentType>("text");
  const [lessonContent, setLessonContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceName, setResourceName] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [availableUsers] = useState([
    { id: "user1", name: "John Doe", role: "client" },
    { id: "user2", name: "Jane Smith", role: "client" },
    { id: "user3", name: "Robert Johnson", role: "employee" },
    { id: "user4", name: "Lisa Brown", role: "expert" },
  ]);

  // Initialize the form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: editCourse?.title || "",
      description: editCourse?.description || "",
      tags: editCourse?.tags || [],
      thumbnailUrl: editCourse?.thumbnailUrl || "",
    },
  });
  
  // Reset form when edit course changes
  useEffect(() => {
    if (editCourse) {
      form.reset({
        title: editCourse.title,
        description: editCourse.description,
        tags: editCourse.tags,
        thumbnailUrl: editCourse.thumbnailUrl || "",
      });
      setModules(editCourse.modules);
      setAssignedUsers(editCourse.enrolledUsers || []);
    } else {
      form.reset({
        title: "",
        description: "",
        tags: [],
        thumbnailUrl: "",
      });
      setModules([]);
      setAssignedUsers([]);
    }
    setCurrentStep("basic");
    setCurrentModule(null);
    setCurrentLesson(null);
  }, [editCourse, form]);

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!form.getValues().tags.includes(tagInput.trim())) {
        form.setValue("tags", [...form.getValues().tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      form.getValues().tags.filter((t) => t !== tag)
    );
  };

  // Toggle user assignment
  const toggleUserAssignment = (userId: string) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter(id => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  // Module and lesson management
  const addModule = () => {
    const newModule: Module = {
      id: uuidv4(),
      title: `New Module ${modules.length + 1}`,
      description: "Module description",
      lessons: [],
      order: modules.length,
    };
    setModules([...modules, newModule]);
    setCurrentModule(newModule);
    setCurrentLesson(null);
  };

  const updateModule = (moduleId: string, field: keyof Module, value: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, [field]: value };
        }
        return m;
      })
    );
    
    if (currentModule?.id === moduleId) {
      setCurrentModule({ ...currentModule, [field]: value });
    }
  };

  const addLesson = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const newLesson: Lesson = {
      id: uuidv4(),
      title: `New Lesson ${module.lessons.length + 1}`,
      description: "Lesson description",
      content: "",
      order: module.lessons.length,
    };

    const updatedModules = modules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    });

    setModules(updatedModules);
    setCurrentModule(updatedModules.find((m) => m.id === moduleId) || null);
    setCurrentLesson(newLesson);
    setContentType("text");
    setLessonContent("");
    setVideoUrl("");
    setQuizQuestions([]);
    setResourceFile(null);
    setResourceName("");
  };

  const updateLesson = (lessonId: string, field: keyof Lesson, value: string) => {
    const updatedModules = modules.map((module) => {
      const updatedLessons = module.lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          return { ...lesson, [field]: value };
        }
        return lesson;
      });
      return { ...module, lessons: updatedLessons };
    });

    setModules(updatedModules);
    
    if (currentLesson?.id === lessonId) {
      setCurrentLesson({ ...currentLesson, [field]: value });
    }
  };

  const saveLessonContent = () => {
    if (!currentLesson) return;

    let updatedLesson: Lesson = { ...currentLesson };

    switch (contentType) {
      case "text":
        updatedLesson.content = lessonContent;
        break;
      case "video":
        updatedLesson.videoUrl = videoUrl;
        break;
      case "article":
        updatedLesson.articleUrl = articleUrl;
        break;
      case "quiz":
        updatedLesson.quiz = {
          id: uuidv4(),
          questions: quizQuestions,
        };
        break;
      case "image":
      case "pdf":
        if (resourceFile && resourceName) {
          const newResource: Resource = {
            id: uuidv4(),
            name: resourceName,
            url: URL.createObjectURL(resourceFile), // In a real app, this would be a server URL
            type: contentType === "image" ? "image" : "pdf",
          };
          
          updatedLesson.resources = [
            ...(updatedLesson.resources || []),
            newResource,
          ];
          
          // Clear the form
          setResourceFile(null);
          setResourceName("");
        }
        break;
      default:
        break;
    }

    const updatedModules = modules.map((module) => {
      const updatedLessons = module.lessons.map((lesson) => {
        if (lesson.id === currentLesson.id) {
          return updatedLesson;
        }
        return lesson;
      });
      return { ...module, lessons: updatedLessons };
    });

    setModules(updatedModules);
    setCurrentLesson(updatedLesson);
    toast({
      title: "Content saved",
      description: "Lesson content has been updated",
    });
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (file: File | null) => {
    setThumbnailFile(file);
    
    if (file) {
      // In a real app, this would upload to a server and get a URL back
      // For this demo, we'll use a local object URL
      const thumbnailUrl = URL.createObjectURL(file);
      form.setValue("thumbnailUrl", thumbnailUrl);
    } else {
      form.setValue("thumbnailUrl", "");
    }
  };

  // Form submission
  const onSubmit = (values: CourseFormValues) => {
    if (currentStep === "basic") {
      setCurrentStep("modules");
      return;
    }

    if (currentStep === "modules" && modules.length > 0) {
      setCurrentStep("review");
      return;
    }

    if (currentStep === "review") {
      // Create or update the course
      const courseData: Course = {
        id: editCourse?.id || uuidv4(),
        title: values.title,
        description: values.description,
        modules: modules,
        tags: values.tags,
        thumbnailUrl: values.thumbnailUrl,
        enrolledUsers: assignedUsers,
      };

      if (editCourse) {
        // Update existing course
        const courseIndex = COURSES.findIndex(c => c.id === editCourse.id);
        if (courseIndex !== -1) {
          COURSES[courseIndex] = courseData;
          toast({
            title: "Course updated",
            description: "Your course has been updated successfully",
          });
        }
      } else {
        // Create new course
        COURSES.push(courseData);
        toast({
          title: "Course created",
          description: "Your new course has been created successfully",
        });
      }

      onOpenChange(false);
      navigate("/admin/courses");
    }
  };

  const goBack = () => {
    if (currentStep === "modules") {
      setCurrentStep("basic");
    } else if (currentStep === "review") {
      setCurrentStep("modules");
    }
  };

  const removeResource = (lessonId: string, resourceId: string) => {
    if (!currentLesson) return;
    
    const updatedModules = modules.map(module => {
      const updatedLessons = module.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.resources) {
          return {
            ...lesson,
            resources: lesson.resources.filter(resource => resource.id !== resourceId)
          };
        }
        return lesson;
      });
      return { ...module, lessons: updatedLessons };
    });
    
    setModules(updatedModules);
    
    // Update current lesson if it's the one being modified
    if (currentLesson.id === lessonId) {
      const updatedLesson = updatedModules
        .flatMap(m => m.lessons)
        .find(l => l.id === lessonId);
      
      if (updatedLesson) {
        setCurrentLesson(updatedLesson);
      }
    }
    
    toast({
      title: "Resource removed",
      description: "The resource has been removed from this lesson",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
          <DialogDescription>
            Build a course with modules and lessons for your users.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduction to Health Tech" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A comprehensive introduction to health technology..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={() => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                placeholder="Add tag and press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                              />
                              <div className="flex flex-wrap gap-2 mt-2">
                                {form.getValues().tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="gap-1">
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(tag)}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="thumbnailUrl"
                      render={() => (
                        <FormItem>
                          <FormLabel>Course Thumbnail</FormLabel>
                          <FormControl>
                            <FileUpload
                              onChange={handleThumbnailUpload}
                              value={thumbnailFile}
                              previewUrl={form.getValues().thumbnailUrl}
                              accept="image/*"
                              type="image"
                              buttonText="Upload thumbnail"
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended size: 1280x720px
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>Assign Users</FormLabel>
                      <FormDescription>
                        Select specific users to enroll in this course
                      </FormDescription>
                      <div className="border rounded-md mt-2 overflow-hidden">
                        <div className="max-h-[200px] overflow-y-auto">
                          {availableUsers.map((user) => (
                            <div 
                              key={user.id} 
                              className="flex items-center p-2 hover:bg-muted"
                            >
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={assignedUsers.includes(user.id)}
                                onCheckedChange={() => toggleUserAssignment(user.id)}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`user-${user.id}`}
                                className="flex justify-between w-full cursor-pointer"
                              >
                                <span>{user.name}</span>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {user.role}
                                </Badge>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "modules" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Course Modules</h3>
                  <Button type="button" onClick={addModule} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Module
                  </Button>
                </div>

                {modules.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No modules yet. Add your first module to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 border rounded-md overflow-hidden">
                      <div className="font-medium p-2 bg-muted">Modules</div>
                      <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {modules.map((module) => (
                          <div
                            key={module.id}
                            className={`p-2 rounded cursor-pointer ${
                              currentModule?.id === module.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => {
                              setCurrentModule(module);
                              setCurrentLesson(null);
                            }}
                          >
                            <div className="font-medium">{module.title}</div>
                            <div className="text-xs">
                              {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-3">
                      {currentModule ? (
                        <div className="space-y-4">
                          <div>
                            <FormLabel htmlFor="module-title">Module Title</FormLabel>
                            <Input
                              id="module-title"
                              value={currentModule.title}
                              onChange={(e) =>
                                updateModule(currentModule.id, "title", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <FormLabel htmlFor="module-description">Module Description</FormLabel>
                            <Textarea
                              id="module-description"
                              value={currentModule.description}
                              onChange={(e) =>
                                updateModule(currentModule.id, "description", e.target.value)
                              }
                            />
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Lessons</h4>
                              <Button
                                type="button"
                                onClick={() => addLesson(currentModule.id)}
                                size="sm"
                                variant="outline"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Lesson
                              </Button>
                            </div>

                            {currentModule.lessons.length === 0 ? (
                              <div className="text-center p-4 border border-dashed rounded-md">
                                <p className="text-muted-foreground">
                                  No lessons yet. Add your first lesson to this module.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 mb-4">
                                {currentModule.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className={`p-2 rounded cursor-pointer ${
                                      currentLesson?.id === lesson.id
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setCurrentLesson(lesson)}
                                  >
                                    {lesson.title}
                                  </div>
                                ))}
                              </div>
                            )}

                            {currentLesson && (
                              <div className="border p-4 rounded-md space-y-4">
                                <div>
                                  <FormLabel htmlFor="lesson-title">Lesson Title</FormLabel>
                                  <Input
                                    id="lesson-title"
                                    value={currentLesson.title}
                                    onChange={(e) =>
                                      updateLesson(currentLesson.id, "title", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <FormLabel htmlFor="lesson-description">
                                    Lesson Description
                                  </FormLabel>
                                  <Textarea
                                    id="lesson-description"
                                    value={currentLesson.description}
                                    onChange={(e) =>
                                      updateLesson(currentLesson.id, "description", e.target.value)
                                    }
                                  />
                                </div>

                                <div>
                                  <FormLabel>Lesson Content</FormLabel>
                                  <Tabs
                                    defaultValue="text"
                                    value={contentType}
                                    onValueChange={(value) => setContentType(value as ContentType)}
                                    className="w-full"
                                  >
                                    <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
                                      <TabsTrigger value="text" className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2" /> Text
                                      </TabsTrigger>
                                      <TabsTrigger value="video" className="flex items-center">
                                        <Video className="h-4 w-4 mr-2" /> Video
                                      </TabsTrigger>
                                      <TabsTrigger value="image" className="flex items-center">
                                        <Image className="h-4 w-4 mr-2" /> Image
                                      </TabsTrigger>
                                      <TabsTrigger value="pdf" className="flex items-center">
                                        <File className="h-4 w-4 mr-2" /> PDF
                                      </TabsTrigger>
                                      <TabsTrigger value="article" className="flex items-center">
                                        <Link className="h-4 w-4 mr-2" /> Article
                                      </TabsTrigger>
                                      <TabsTrigger value="quiz" className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2" /> Quiz
                                      </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="text" className="mt-2">
                                      <Textarea
                                        placeholder="Enter the lesson content..."
                                        className="min-h-[200px]"
                                        value={lessonContent}
                                        onChange={(e) => setLessonContent(e.target.value)}
                                      />
                                    </TabsContent>
                                    
                                    <TabsContent value="video" className="mt-2">
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                          />
                                          <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => {
                                              if (videoUrl) saveLessonContent();
                                            }}
                                          >
                                            Add
                                          </Button>
                                        </div>
                                        
                                        <div className="text-sm text-muted-foreground">
                                          Or upload a video file:
                                        </div>
                                        
                                        <FileUpload
                                          onChange={setResourceFile}
                                          accept="video/*"
                                          type="video"
                                          buttonText="Upload video"
                                        />
                                        
                                        {resourceFile && resourceFile.type.startsWith("video/") && (
                                          <div className="space-y-2">
                                            <FormLabel>Video Title</FormLabel>
                                            <div className="flex gap-2">
                                              <Input
                                                placeholder="Enter a name for this video"
                                                value={resourceName}
                                                onChange={(e) => setResourceName(e.target.value)}
                                              />
                                              <Button 
                                                type="button"
                                                onClick={saveLessonContent}
                                                disabled={!resourceName}
                                              >
                                                Save
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {currentLesson?.videoUrl && (
                                          <div className="p-3 border rounded-md mt-4">
                                            <div className="font-medium mb-1">Current Video:</div>
                                            <div className="text-sm text-muted-foreground break-all">
                                              {currentLesson.videoUrl}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="image" className="mt-2 space-y-4">
                                      <FileUpload
                                        onChange={setResourceFile}
                                        accept="image/*"
                                        type="image"
                                        buttonText="Upload image"
                                      />
                                      
                                      {resourceFile && resourceFile.type.startsWith("image/") && (
                                        <div className="space-y-2">
                                          <FormLabel>Image Title</FormLabel>
                                          <div className="flex gap-2">
                                            <Input
                                              placeholder="Enter a name for this image"
                                              value={resourceName}
                                              onChange={(e) => setResourceName(e.target.value)}
                                            />
                                            <Button 
                                              type="button"
                                              onClick={saveLessonContent}
                                              disabled={!resourceName}
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {currentLesson?.resources && currentLesson.resources.length > 0 && (
                                        <div className="border rounded-md p-3 mt-2">
                                          <div className="font-medium mb-2">Attached Images:</div>
                                          <div className="space-y-2">
                                            {currentLesson.resources
                                              .filter(r => r.type === "image")
                                              .map(resource => (
                                                <div 
                                                  key={resource.id} 
                                                  className="flex justify-between items-center p-2 border rounded"
                                                >
                                                  <div className="flex items-center">
                                                    <FileImage className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span>{resource.name}</span>
                                                  </div>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeResource(currentLesson.id, resource.id)}
                                                    className="text-destructive hover:text-destructive"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                    </TabsContent>
                                    
                                    <TabsContent value="pdf" className="mt-2 space-y-4">
                                      <FileUpload
                                        onChange={setResourceFile}
                                        accept=".pdf,application/pdf"
                                        type="pdf"
                                        buttonText="Upload PDF"
                                      />
                                      
                                      {resourceFile && 
                                        (resourceFile.type === "application/pdf" || 
                                         resourceFile.name.endsWith(".pdf")) && (
                                        <div className="space-y-2">
                                          <FormLabel>PDF Title</FormLabel>
                                          <div className="flex gap-2">
                                            <Input
                                              placeholder="Enter a name for this PDF"
                                              value={resourceName}
                                              onChange={(e) => setResourceName(e.target.value)}
                                            />
                                            <Button 
                                              type="button"
                                              onClick={saveLessonContent}
                                              disabled={!resourceName}
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {currentLesson?.resources && currentLesson.resources.length > 0 && (
                                        <div className="border rounded-md p-3 mt-2">
                                          <div className="font-medium mb-2">Attached PDFs:</div>
                                          <div className="space-y-2">
                                            {currentLesson.resources
                                              .filter(r => r.type === "pdf")
                                              .map(resource => (
                                                <div 
                                                  key={resource.id} 
                                                  className="flex justify-between items-center p-2 border rounded"
                                                >
                                                  <div className="flex items-center">
                                                    <File className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span>{resource.name}</span>
                                                  </div>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeResource(currentLesson.id, resource.id)}
                                                    className="text-destructive hover:text-destructive"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                    </TabsContent>
                                    
                                    <TabsContent value="article" className="mt-2">
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="Enter article URL"
                                            value={articleUrl}
                                            onChange={(e) => setArticleUrl(e.target.value)}
                                          />
                                          <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => {
                                              if (articleUrl) saveLessonContent();
                                            }}
                                          >
                                            Add
                                          </Button>
                                        </div>
                                        
                                        {currentLesson?.articleUrl && (
                                          <div className="p-3 border rounded-md mt-4">
                                            <div className="font-medium mb-1">Current Article:</div>
                                            <div className="text-sm text-muted-foreground break-all">
                                              {currentLesson.articleUrl}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="quiz" className="mt-2">
                                      <QuizBuilder 
                                        questions={quizQuestions} 
                                        onChange={setQuizQuestions} 
                                      />
                                      
                                      <Button
                                        type="button"
                                        className="mt-4"
                                        onClick={saveLessonContent}
                                      >
                                        Save Quiz
                                      </Button>
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full border rounded-md p-8">
                          <div className="text-center">
                            <p className="text-muted-foreground mb-2">
                              Select a module or create a new one to start building your course.
                            </p>
                            <Button type="button" onClick={addModule} variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" /> Add Module
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === "review" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-semibold mb-2">{form.getValues().title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {form.getValues().description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {form.getValues().tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Course Structure</h4>
                        <div className="space-y-3">
                          {modules.map((module) => (
                            <div key={module.id} className="border rounded-md p-3">
                              <h5 className="font-medium">{module.title}</h5>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                              
                              <div className="mt-2">
                                <h6 className="text-sm font-medium mb-1">Lessons:</h6>
                                <ul className="text-sm space-y-1 pl-4">
                                  {module.lessons.map((lesson) => (
                                    <li key={lesson.id} className="list-disc list-inside">
                                      {lesson.title}
                                    </li>
                                  ))}
                                  {module.lessons.length === 0 && (
                                    <li className="text-muted-foreground">No lessons</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border rounded-md p-4 space-y-4">
                      {form.getValues().thumbnailUrl && (
                        <div>
                          <h4 className="font-medium mb-2">Thumbnail</h4>
                          <img 
                            src={form.getValues().thumbnailUrl} 
                            alt="Course thumbnail" 
                            className="w-full h-auto rounded-md object-cover"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Enrolled Users</h4>
                        {assignedUsers.length > 0 ? (
                          <div className="space-y-2">
                            {assignedUsers.map(userId => {
                              const user = availableUsers.find(u => u.id === userId);
                              return user ? (
                                <div key={userId} className="flex justify-between items-center p-2 bg-muted rounded-md text-sm">
                                  <span>{user.name}</span>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No users assigned to this course
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Course Stats</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted p-2 rounded-md">
                            <div className="text-muted-foreground">Modules</div>
                            <div className="font-medium">{modules.length}</div>
                          </div>
                          <div className="bg-muted p-2 rounded-md">
                            <div className="text-muted-foreground">Lessons</div>
                            <div className="font-medium">
                              {modules.reduce((total, module) => total + module.lessons.length, 0)}
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded-md">
                            <div className="text-muted-foreground">Enrolled</div>
                            <div className="font-medium">{assignedUsers.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              {currentStep !== "basic" && (
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
              )}
              <Button type="submit">
                {currentStep === "review" 
                  ? editCourse 
                    ? "Save Changes" 
                    : "Create Course" 
                  : currentStep === "modules" && modules.length > 0
                    ? "Continue" 
                    : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
