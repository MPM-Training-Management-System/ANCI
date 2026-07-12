"use client";

import { useState } from "react";
import {
  Button,
  FileUpload,
  Input,
} from "@repo/ui/index";

interface UserFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export function UserForm({
  onCancel,
  onSubmit,
}: UserFormProps) {
  const [profileImage, setProfileImage] = useState<File[]>([]);

  return (
    <div className="space-y-4">
      <Input placeholder="Full Name" />

      <Input placeholder="Email Address" />

      <Input placeholder="Role" />

      <FileUpload
        accept="image/*"
        onChange={setProfileImage}
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            console.log(profileImage);
            onSubmit();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}