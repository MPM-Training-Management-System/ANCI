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
        "rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
        className
      )}
      {...props}
    >
      <div className="p-5">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>

              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>

            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            {/* HEADER + VALUE */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* TITLE */}
                <p className="text-xs font-medium text-gray-500">
                  {title}
                </p>

                {/* VALUE */}
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#17191c]">
                  {value}
                </p>
              </div>

              {/* ICON */}
              {Icon && (
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    getIconStyles(variant)
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {description && (
              <p className="mt-4 text-[11px] text-gray-400">
                {description}
              </p>
            )}

            {/* FOOTER / TREND */}
            {footer && (
              <div className="mt-3">
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getIconStyles(
  variant?: StatCardProps["variant"]
) {
  switch (variant) {
    case "primary":
      return "bg-blue-50 text-blue-700";

    case "success":
      return "bg-emerald-50 text-emerald-700";

    case "warning":
      return "bg-amber-50 text-amber-700";

    case "default":
    default:
      return "bg-[#f4f5f6] text-gray-600";
  }
}