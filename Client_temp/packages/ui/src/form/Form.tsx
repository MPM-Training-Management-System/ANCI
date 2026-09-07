"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {}

export function Form({
  className,
  children,
  ...props
}: FormProps) {
  return (
    <form
      className={cn(
        "space-y-6",
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}