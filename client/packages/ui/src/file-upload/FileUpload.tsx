"use client";

import * as React from "react";

import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

export function FileUpload({
  accept,
  multiple = false,
  disabled = false,
  onChange,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = React.useState<File[]>([]);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    const updated = multiple
      ? [...files, ...newFiles]
      : newFiles;

    setFiles(updated);

    onChange?.(updated);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);

    setFiles(updated);

    onChange?.(updated);
  };

  return (
    <>
      <input
        hidden
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Dropzone
        dragging={dragging}
        disabled={disabled}
        accept={accept}
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
      />

      <FileList
        files={files}
        onRemove={removeFile}
      />
    </>
  );
}