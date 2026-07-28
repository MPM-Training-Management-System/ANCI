import { cva } from "class-variance-authority";

export const statCardVariants = cva(
  "relative overflow-hidden rounded-xl border bg-background shadow-sm transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-muted",
        primary:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary",
        success:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500",
        warning:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-amber-500",
        danger:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-500",
        info:
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-sky-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);