import { cn } from "@repo/lib";
import { footerVariants } from "./DataGrid.styles";

export function DataGridFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        footerVariants(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}