import * as React from "react";
import { cn } from "@repo/lib";

export interface AppShellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({
  sidebar,
  header,
  children,
  className,
  ...props
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-background",
        className
      )}
      {...props}
    >
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col">
        {header}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}