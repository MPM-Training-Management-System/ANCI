import * as React from "react";
import { cn } from "@repo/lib";

export interface ActivityItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  avatar: React.ReactNode;
  title: string;
  description?: string;
  time?: string;
  actions?: React.ReactNode;
}

export function ActivityItem({
  avatar,
  title,
  description,
  time,
  actions,
  className,
  ...props
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        "border-border last:border-0 space-y-4 border-b pb-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full font-semibold">
          {avatar}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium">{title}</h4>

          {description && (
            <p className="text-muted-foreground truncate text-sm">
              {description}
            </p>
          )}

          {time && (
            <p className="text-muted-foreground mt-1 text-xs">
              {time}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}