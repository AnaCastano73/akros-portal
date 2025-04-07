
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileIcon, UploadIcon, X, ImageIcon, FileTextIcon, FileVideoIcon } from "lucide-react";

interface FileUploadProps {
  onChange?: (file: File | null) => void;
  value?: File | string | null;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
  previewUrl?: string;
  type?: "image" | "video" | "pdf" | "document" | "any";
}

export function FileUpload({
  onChange,
  value,
  accept = "image/*",
  maxSize = 5, // Default 5MB
  className,
  buttonText = "Upload file",
  previewUrl,
  type = "any",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : previewUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine accept attribute based on type
  const getAcceptType = () => {
    switch (type) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "pdf":
        return "application/pdf";
      case "document":
        return ".doc,.docx,.txt,.rtf";
      default:
        return accept;
    }
  };

  // Get icon based on file type
  const getIcon = () => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-6 h-6 text-muted-foreground" />;
      case "video":
        return <FileVideoIcon className="w-6 h-6 text-muted-foreground" />;
      case "pdf":
      case "document":
        return <FileTextIcon className="w-6 h-6 text-muted-foreground" />;
      default:
        return <FileIcon className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFile(file);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Create a preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Call onChange handler
    if (onChange) {
      onChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const clearFile = () => {
    setPreview(null);
    if (onChange) {
      onChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 transition-colors flex flex-col items-center justify-center cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          preview ? "py-2" : "py-6"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview && type === "image" ? (
          <div className="relative w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={preview}
              alt="Preview"
              className="max-h-[150px] mx-auto object-contain rounded"
            />
            <p className="text-sm text-center mt-2">{value instanceof File ? value.name : "Uploaded file"}</p>
          </div>
        ) : uploading ? (
          <div className="w-full space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center">Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              {getIcon()}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  <span className="text-primary">{buttonText}</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {type.charAt(0).toUpperCase() + type.slice(1)} up to {maxSize}MB
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
