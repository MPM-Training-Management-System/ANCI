"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Card } from "./card";
import { Button } from "./button";

interface EmptyActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  buttonLabel?: string;
  onClick?: () => void;
}

export function EmptyActionCard({
  title,
  description,
  icon,
  buttonLabel = "Create",
  onClick,
}: EmptyActionCardProps) {
  return (
    <Card
      className="
        flex min-h-[420px] cursor-pointer flex-col items-center
        justify-center border-2 border-dashed
        transition-all duration-300
        hover:border-primary
        hover:bg-muted/40
        hover:shadow-md
      "
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon ?? <Plus className="h-8 w-8" />}
      </div>

      <h3 className="text-center text-xl font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <Button
        className="mt-8"
        onClick={onClick}
      >
        {buttonLabel}
      </Button>
    </Card>
  );
}