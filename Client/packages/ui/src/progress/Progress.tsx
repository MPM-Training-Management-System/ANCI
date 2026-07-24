import { cn } from "@repo/lib";

import { progressVariants } from "./Progress.styles";

import type { ProgressProps } from "./Progress.types";

export function Progress({
  value,
  color,
  showValue = true,
  className,
}: ProgressProps) {
  return (
    <div className="flex items-center gap-3">

      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">

        <div
          className={cn(
            progressVariants({ color }),
            className
          )}
          style={{
            width: `${Math.min(
              Math.max(value, 0),
              100
            )}%`,
          }}
        />

      </div>

      {showValue && (
        <span className="min-w-10 text-right text-xs font-medium text-muted-foreground">
          {value}%
        </span>
      )}

    </div>
  );
}