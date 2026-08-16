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
  Textarea,
} from "@repo/ui/index";

interface TrainingFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function TrainingForm({
  onSubmit,
  onCancel,
}: TrainingFormProps) {
  const [thumbnail, setThumbnail] = useState<File[]>([]);

  return (
    <Form>

      <div className="grid gap-5 md:grid-cols-2">

        <FormField
          label="Program Code"
          required
        >
          <Input placeholder="TR-001" />
        </FormField>

        <FormField
          label="Program Name"
          required
        >
          <Input placeholder="Leadership Development Program" />
        </FormField>

        <FormField
          label="Category"
          required
        >
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="leadership">
                Leadership
              </SelectItem>

              <SelectItem value="technical">
                Technical
              </SelectItem>

              <SelectItem value="soft-skills">
                Soft Skills
              </SelectItem>

              <SelectItem value="sports">
                Sports
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Trainer"
          required
        >
          <Input placeholder="John Doe" />
        </FormField>

        <FormField
          label="Capacity"
          required
        >
          <Input
            type="number"
            placeholder="100"
          />
        </FormField>

        <FormField
          label="Status"
          required
        >
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="draft">
                Draft
              </SelectItem>

              <SelectItem value="open">
                Open
              </SelectItem>

              <SelectItem value="ongoing">
                Ongoing
              </SelectItem>

              <SelectItem value="completed">
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Start Date"
          required
        >
          <Input type="date" />
        </FormField>

        <FormField
          label="End Date"
          required
        >
          <Input type="date" />
        </FormField>

      </div>

      <FormField
        label="Description"
        required
      >
        <Textarea
          rows={5}
          placeholder="Enter training description..."
        />
      </FormField>

      <FormField
        label="Program Thumbnail"
      >
        <FileUpload
          accept="image/*"
          onChange={setThumbnail}
        />
      </FormField>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            console.log(thumbnail);
            onSubmit();
          }}
        >
          Save Program
        </Button>

      </div>

    </Form>
  );
}