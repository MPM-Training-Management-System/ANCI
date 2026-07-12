"use client";

import { X } from "lucide-react";
import { formatFileSize } from "./FileUtils";

interface FileItemProps {
  file: File;
  onRemove: () => void;
}

export function FileItem({
  file,
  onRemove,
}: FileItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">

      <div>

        <p className="font-medium">
          {file.name}
        </p>

        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.size)}
        </p>

      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-600"
      >
        <X size={18} />
      </button>

    </div>
  );
}