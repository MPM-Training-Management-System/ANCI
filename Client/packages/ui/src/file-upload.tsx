"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@repo/lib";

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (files: File[]) => void;
}

export function FileUpload({
  accept,
  multiple = false,
  disabled = false,
  className,
  onChange,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    onChange?.(fileArray);
  };

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-10 transition-all",
          dragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <UploadCloud
            className={cn(
              "h-12 w-12",
              dragging
                ? "text-primary"
                : "text-muted-foreground"
            )}
          />

          <div className="text-center">
            <h3 className="font-semibold">
              Upload Files
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Drag & Drop files here or click to browse
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {accept || "All file types"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}