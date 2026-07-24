import { cn } from "@repo/lib";

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("space-y-6", className)}
      {...props}
    >
      {children}
    </section>
  );
}