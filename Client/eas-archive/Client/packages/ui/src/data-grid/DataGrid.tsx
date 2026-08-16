import { cn } from "@repo/lib";

import { dataGridVariants } from "./DataGrid.styles";
import type { DataGridProps } from "./DataGrid.types";

export function DataGrid({
  className,
  children,
  ...props
}: DataGridProps) {
  return (
    <div
      className={cn(
        dataGridVariants(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}