
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X, Edit2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "short_answer";
  options?: QuizOption[];
  correctAnswers?: string[];
}

export interface QuizOption {
  id: string;
  text: string;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);
  const [newOption, setNewOption] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Add a new question
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: uuidv4(),
      question: "",
      type: "multiple_choice",
      options: [],
      correctAnswers: [],
    };
    
    const updatedQuestions = [...questions, newQuestion];
    onChange(updatedQuestions);
    setActiveQuestion(newQuestion);
    setEditMode(true);
  };

  // Update a question
  const updateQuestion = (id: string, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === id) {
        // If changing from multiple choice to short answer, clear options and correct answers
        if (field === "type" && value === "short_answer") {
          return { ...q, [field]: value, options: [], correctAnswers: [] };
        }
        return { ...q, [field]: value };
      }
      return q;
    });
    
    onChange(updatedQuestions);
    
    if (activeQuestion?.id === id) {
      const updated = updatedQuestions.find(q => q.id === id);
      if (updated) setActiveQuestion(updated);
    }
  };

  // Add an option to a multiple choice question
  const addOption = () => {
    if (!activeQuestion || !newOption.trim()) return;
    
    const newOpt: QuizOption = {
      id: uuidv4(),
      text: newOption.trim(),
    };
    
    const updatedOptions = [...(activeQuestion.options || []), newOpt];
    
    updateQuestion(activeQuestion.id, "options", updatedOptions);
    setNewOption("");
  };

  // Remove an option
  const removeOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    
    const updatedOptions = question.options.filter(opt => opt.id !== optionId);
    
    // Also remove from correct answers if it was selected
    const updatedCorrectAnswers = (question.correctAnswers || []).filter(id => id !== optionId);
    
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          options: updatedOptions,
          correctAnswers: updatedCorrectAnswers
        };
      }
      return q;
    });
    
    onChange(updatedQuestions);
    
    if (activeQuestion?.id === questionId) {
      const updated = updatedQuestions.find(q => q.id === questionId);
      if (updated) setActiveQuestion(updated);
    }
  };

  // Toggle whether an option is a correct answer
  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    let updatedCorrectAnswers = [...(question.correctAnswers || [])];
    
    if (updatedCorrectAnswers.includes(optionId)) {
      updatedCorrectAnswers = updatedCorrectAnswers.filter(id => id !== optionId);
    } else {
      updatedCorrectAnswers.push(optionId);
    }
    
    updateQuestion(questionId, "correctAnswers", updatedCorrectAnswers);
  };

  // Delete a question
  const deleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onChange(updatedQuestions);
    
    if (activeQuestion?.id === id) {
      setActiveQuestion(null);
      setEditMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quiz Builder</h3>
        <Button 
          onClick={addQuestion} 
          variant="outline"
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question list sidebar */}
        <div className="border rounded-md p-3 h-[400px] overflow-y-auto">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
              <p>No questions yet</p>
              <Button 
                onClick={addQuestion} 
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {questions.map((q, index) => (
                <li 
                  key={q.id} 
                  className={cn(
                    "p-2 rounded-md cursor-pointer",
                    activeQuestion?.id === q.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => {
                    setActiveQuestion(q);
                    setEditMode(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium">Q{index + 1}: </span>
                      <span className="text-sm truncate">
                        {q.question || "Untitled question"}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {q.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                        </Badge>
                        {q.type === "multiple_choice" && (
                          <Badge variant="outline" className="text-xs">
                            {q.options?.length || 0} options
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(q.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Question editor */}
        <div className="md:col-span-2 border rounded-md p-4">
          {activeQuestion ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  {editMode ? "Edit Question" : "Question Preview"}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Preview" : <Edit2 className="h-4 w-4 mr-2" />}
                  {!editMode && "Edit"}
                </Button>
              </div>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea
                      id="question-text"
                      value={activeQuestion.question}
                      onChange={(e) => updateQuestion(activeQuestion.id, "question", e.target.value)}
                      placeholder="Enter your question here..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Question Type</Label>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroup
                          value={activeQuestion.type}
                          onValueChange={(value) => 
                            updateQuestion(
                              activeQuestion.id,
                              "type",
                              value as "multiple_choice" | "short_answer"
                            )
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                            <Label htmlFor="multiple_choice">Multiple Choice</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="short_answer" id="short_answer" />
                            <Label htmlFor="short_answer">Short Answer</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  {activeQuestion.type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      
                      <div className="rounded-md border divide-y">
                        {activeQuestion.options?.map((option) => (
                          <div 
                            key={option.id} 
                            className="flex items-center p-2"
                          >
                            <div 
                              className="cursor-pointer mr-2"
                              onClick={() => toggleCorrectAnswer(activeQuestion.id, option.id)}
                            >
                              {activeQuestion.correctAnswers?.includes(option.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                value={option.text}
                                onChange={(e) => {
                                  const updatedOptions = activeQuestion.options?.map(opt => {
                                    if (opt.id === option.id) {
                                      return { ...opt, text: e.target.value };
                                    }
                                    return opt;
                                  });
                                  
                                  updateQuestion(activeQuestion.id, "options", updatedOptions);
                                }}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(activeQuestion.id, option.id)}
                              className="ml-2 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add an option"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addOption();
                            }
                          }}
                        />
                        <Button
                          onClick={addOption}
                          type="button"
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      
                      {(activeQuestion.options?.length || 0) > 0 && (
                        <div className="text-xs text-muted-foreground pt-2">
                          Click the circle to mark the correct answer(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="text-lg">{activeQuestion.question || "Untitled question"}</div>
                  
                  {activeQuestion.type === "multiple_choice" ? (
                    <div className="space-y-2">
                      {activeQuestion.options?.map((option) => (
                        <div 
                          key={option.id} 
                          className={cn(
                            "flex items-center p-3 rounded-md border",
                            activeQuestion.correctAnswers?.includes(option.id) && 
                            "border-green-500 bg-green-50"
                          )}
                        >
                          <div className="mr-2">
                            {activeQuestion.correctAnswers?.includes(option.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                          <div>{option.text}</div>
                        </div>
                      ))}
                      
                      {(activeQuestion.options?.length || 0) === 0 && (
                        <div className="text-muted-foreground">
                          No options added yet. Switch to edit mode to add options.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground italic">Short answer text field will display here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-4 text-muted-foreground">
              <p>Select a question to edit or preview</p>
              <Button 
                onClick={addQuestion} 
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
