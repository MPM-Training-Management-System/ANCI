"use client";

import { FileItem } from "./FileItem";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FileList({
  files,
  onRemove,
}: FileListProps) {
  if (!files.length) return null;

  return (
    <div className="mt-6 space-y-3">

      <h3 className="font-semibold">
        Selected Files
      </h3>

      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}

    </div>
  );
}