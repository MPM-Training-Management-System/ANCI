import { cn } from "@repo/lib";
import { contentVariants } from "./DataGrid.styles";

export function DataGridContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        contentVariants(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}