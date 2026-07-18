"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@repo/lib";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

export interface SectionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;

  actionLabel?: string;
  onAction?: () => void;

  headerRight?: React.ReactNode;

  children: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  actionLabel,
  onAction,
  headerRight,
  children,
  className,
  ...props
}: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>

          {description && (
            <CardDescription>
              {description}
            </CardDescription>
          )}
        </div>

        {headerRight ? (
          headerRight
        ) : actionLabel ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="gap-1"
          >
            {actionLabel}

            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}