"use client";

import * as React from "react";
import { FormLabel } from "./FormLabel";
import { FormError } from "./FormError";
import { FormDescription } from "./FormDescription";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  error,
  description,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          {label}
        </FormLabel>
      )}

      {children}

      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}

      {error && (
        <FormError>
          {error}
        </FormError>
      )}
    </div>
  );
}