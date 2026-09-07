import { Card, Skeleton } from "@repo/ui/index";
import { statCardVariants } from "./StatCard.styles";

interface StatCardSkeletonProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function StatCardSkeleton({
  variant = "default",
}: StatCardSkeletonProps) {
  return (
    <Card className={statCardVariants({ variant })}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>

        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </Card>
  );
}