
import { useState } from "react";
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
import { X, Plus, FileText, Image, Video, BookOpen } from "lucide-react";

// Types
import { Course, Module, Lesson } from "@/types/course";

const courseFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  tags: z.array(z.string()).min(1, { message: "Add at least one tag" }),
  visibleTo: z.array(z.enum(["client", "expert", "employee", "admin"])).min(1, { message: "Select at least one role" }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

type Step = "basic" | "modules" | "review";

type ContentType = "text" | "video" | "pdf" | "image" | "quiz";

interface CreateCourseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseDialog({ isOpen, onOpenChange }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [contentType, setContentType] = useState<ContentType>("text");
  const [lessonContent, setLessonContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Initialize the form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      visibleTo: ["client"],
    },
  });

  const roles = [
    { value: "client", label: "Client" },
    { value: "expert", label: "Expert" },
    { value: "employee", label: "Employee" },
    { value: "admin", label: "Admin" },
  ];

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

  const toggleRole = (role: "client" | "expert" | "employee" | "admin") => {
    const currentRoles = form.getValues().visibleTo;
    if (currentRoles.includes(role)) {
      form.setValue(
        "visibleTo",
        currentRoles.filter((r) => r !== role)
      );
    } else {
      form.setValue("visibleTo", [...currentRoles, role]);
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
    setImageUrl("");
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
      case "image":
        updatedLesson.resources = [
          ...(updatedLesson.resources || []),
          {
            id: uuidv4(),
            name: "Image",
            url: imageUrl,
            type: "image",
          },
        ];
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
      // Create the new course
      const newCourse: Course = {
        id: uuidv4(),
        title: values.title,
        description: values.description,
        modules: modules,
        tags: values.tags,
        visibleTo: values.visibleTo,
      };

      // In a real app, this would be an API call
      // For now, we'll just add it to the mock data
      COURSES.push(newCourse);

      toast({
        title: "Course created",
        description: "Your new course has been created successfully",
      });

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Build a new course with modules and lessons for your users.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === "basic" && (
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="visibleTo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Visible To</FormLabel>
                      <FormDescription>
                        Select which user roles can access this course
                      </FormDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {roles.map((role) => (
                          <Badge
                            key={role.value}
                            variant={
                              form
                                .getValues()
                                .visibleTo.includes(
                                  role.value as "client" | "expert" | "employee" | "admin"
                                )
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              toggleRole(role.value as "client" | "expert" | "employee" | "admin")
                            }
                          >
                            {role.label}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                                    <TabsList className="w-full">
                                      <TabsTrigger value="text" className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2" /> Text
                                      </TabsTrigger>
                                      <TabsTrigger value="video" className="flex items-center">
                                        <Video className="h-4 w-4 mr-2" /> Video
                                      </TabsTrigger>
                                      <TabsTrigger value="image" className="flex items-center">
                                        <Image className="h-4 w-4 mr-2" /> Image
                                      </TabsTrigger>
                                      <TabsTrigger value="quiz" className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2" /> Quiz
                                      </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="text" className="mt-2">
                                      <Textarea
                                        placeholder="Enter the lesson content..."
                                        className="min-h-[150px]"
                                        value={lessonContent}
                                        onChange={(e) => setLessonContent(e.target.value)}
                                      />
                                    </TabsContent>
                                    <TabsContent value="video" className="mt-2">
                                      <Input
                                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                      />
                                      {videoUrl && (
                                        <div className="mt-2 p-2 border rounded">
                                          <p className="text-sm">Video Preview: {videoUrl}</p>
                                        </div>
                                      )}
                                    </TabsContent>
                                    <TabsContent value="image" className="mt-2">
                                      <Input
                                        placeholder="Enter image URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                      />
                                      {imageUrl && (
                                        <div className="mt-2 p-2 border rounded">
                                          <p className="text-sm">Image Preview: {imageUrl}</p>
                                        </div>
                                      )}
                                    </TabsContent>
                                    <TabsContent value="quiz" className="mt-2">
                                      <p className="text-sm text-muted-foreground">
                                        Quiz builder coming soon! This feature will allow you to
                                        create multiple-choice and open-ended questions.
                                      </p>
                                    </TabsContent>
                                  </Tabs>
                                  <Button
                                    type="button"
                                    className="mt-2"
                                    size="sm"
                                    onClick={saveLessonContent}
                                  >
                                    Save Content
                                  </Button>
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
                  <div className="mb-4">
                    <span className="text-sm font-medium">Visible to: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.getValues().visibleTo.map((role) => (
                        <Badge key={role}>{role}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">
                      {modules.length} Module{modules.length !== 1 ? "s" : ""}
                    </h4>
                    <div className="space-y-2">
                      {modules.map((module) => (
                        <div key={module.id} className="border rounded-md p-2">
                          <h5 className="font-medium">{module.title}</h5>
                          <p className="text-xs text-muted-foreground">{module.description}</p>
                          <div className="mt-2 pl-2 border-l">
                            <div className="text-sm">
                              {module.lessons.length} Lesson{module.lessons.length !== 1 ? "s" : ""}
                            </div>
                            <ul className="text-xs list-disc list-inside text-muted-foreground">
                              {module.lessons.map((lesson) => (
                                <li key={lesson.id}>{lesson.title}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between">
              {currentStep !== "basic" && (
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
              )}
              <Button type="submit">
                {currentStep === "review"
                  ? "Create Course"
                  : currentStep === "modules" && modules.length > 0
                  ? "Next: Review"
                  : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
