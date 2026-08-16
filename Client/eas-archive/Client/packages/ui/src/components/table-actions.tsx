"use client";

import * as React from "react";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";

import { Button } from "./button";
import { cn } from "@repo/lib";

export interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;

  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showMore?: boolean;

  className?: string;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  onMore,

  showView = false,
  showEdit = true,
  showDelete = true,
  showMore = false,

  className,
}: TableActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {showView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}

      {showEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}

      {showMore && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMore}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}