import * as React from "react";
import { cn } from "@repo/lib";

import { Card } from "../components/card";
import { Badge } from "../components/badge";

export interface ActivityListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ActivityList({
  title,
  badge,
  children,
  footer,
  className,
  ...props
}: ActivityListProps) {
  return (
    <Card
      className={cn("p-6", className)}
      {...props}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {badge && (
          <Badge variant="success">
            {badge}
          </Badge>
        )}
      </div>

      <div className="space-y-5">
        {children}
      </div>

      {footer && (
        <div className="mt-6">
          {footer}
        </div>
      )}
    </Card>
  );
}