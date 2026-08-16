"use client";

import * as React from "react";

interface FormDescriptionProps {
  children?: React.ReactNode;
}

export function FormDescription({
  children,
}: FormDescriptionProps) {
  if (!children) return null;

  return (
    <p className="mt-1 text-sm text-muted-foreground">
      {children}
    </p>
  );
}