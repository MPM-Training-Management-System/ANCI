import { cva } from "class-variance-authority";

export const statCardVariants = cva(
  "rounded-xl border bg-background shadow-sm transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "",
        primary: "border-primary/20",
        success: "border-green-300",
        warning: "border-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);