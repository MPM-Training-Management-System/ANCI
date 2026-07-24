import { cn } from "@repo/lib";

import { statCardVariants } from "./StatCard.styles";

import type { StatCardProps } from "./StatCard.types";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  footer,
  variant,
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
        </div>

        {Icon && (
          <div className="rounded-lg bg-blue-50 p-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>

      {footer && (
        <div className="border-t px-6 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}