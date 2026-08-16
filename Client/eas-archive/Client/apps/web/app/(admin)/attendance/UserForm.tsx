"use client";

import { useState } from "react";
import {
  Button,
  FileUpload,
  Form,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
    <Form>

      <FormField
        label="Full Name"
        required
      >
        <Input placeholder="Enter full name" />
      </FormField>

      <FormField
        label="Email Address"
        required
      >
        <Input
          type="email"
          placeholder="Enter email address"
        />
      </FormField>

      <FormField
        label="Role"
        description="Select the user's role."
      >
       <Select>
  <SelectTrigger>
    <SelectValue placeholder="Select Role" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="admin">
      Administrator
    </SelectItem>

    <SelectItem value="trainer">
      Trainer
    </SelectItem>

    <SelectItem value="staff">
      Staff
    </SelectItem>
  </SelectContent>
</Select>
      </FormField>

      <FormField
        label="Profile Image"
        description="Upload a profile picture."
      >
        <FileUpload
          accept="image/*"
          onChange={setProfileImage}
        />
      </FormField>

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

    </Form>
  );
}