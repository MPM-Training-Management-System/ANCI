import { cn } from "@repo/lib";

import { Skeleton } from "../components/skeleton";
import { statCardVariants } from "./StatCard.styles";

import type { StatCardProps } from "./StatCard.types";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  footer,
  variant,
  loading,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        statCardVariants({ variant }),
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between p-6">
        <div className="space-y-2">
          {loading ? (
            <>
              {/* Title */}
              <Skeleton className="h-3 w-24" />

              {/* Value */}
              <Skeleton className="h-9 w-20" />

              {/* Description */}
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </p>

              <h2 className="text-3xl font-bold">
                {value}
              </h2>

              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-12 w-12 rounded-lg" />
        ) : (
          Icon && (
            <div className="rounded-lg bg-blue-50 p-3">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )
        )}
      </div>

      {footer && (
        <div className="border-t px-6 py-3">
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            footer
          )}
        </div>
      )}
    </div>
  );
}