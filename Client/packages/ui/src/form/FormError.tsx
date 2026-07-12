"use client";

import * as React from "react";

interface FormErrorProps {
  children?: React.ReactNode;
}

export function FormError({
  children,
}: FormErrorProps) {
  if (!children) return null;

  return (
    <p className="mt-1 text-sm text-red-500">
      {children}
    </p>
  );
}