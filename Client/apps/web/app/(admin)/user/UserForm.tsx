"use client";

import { Button, Input } from "@repo/ui/index";

interface UserFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export function UserForm({
  onCancel,
  onSubmit,
}: UserFormProps) {
  return (
    <div className="space-y-4">
      <Input placeholder="Full Name" />
      <Input placeholder="Email Address" />
      <Input placeholder="Role" />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button onClick={onSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
}