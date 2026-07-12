"use client";

import { UploadCloud } from "lucide-react";
import { cn } from "@repo/lib";

interface DropzoneProps {
  dragging: boolean;
  disabled?: boolean;
  accept?: string;
  onClick: () => void;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDragLeave: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
}

export function Dropzone({
  dragging,
  disabled,
  accept,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}: DropzoneProps) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-10 transition-all",
        dragging
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-primary",
        disabled && "cursor-not-allowed opacity-50"
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
            {accept ?? "All file types"}
          </p>

        </div>

      </div>
    </div>
  );
}