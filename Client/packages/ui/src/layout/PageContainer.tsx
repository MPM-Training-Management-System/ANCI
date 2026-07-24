import { cn } from "@repo/lib";

interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-8 p-6",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}