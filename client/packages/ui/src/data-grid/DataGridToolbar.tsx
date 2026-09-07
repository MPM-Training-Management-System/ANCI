import { cn } from "@repo/lib";
import { toolbarVariants } from "./DataGrid.styles";

export function DataGridToolbar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        toolbarVariants(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}