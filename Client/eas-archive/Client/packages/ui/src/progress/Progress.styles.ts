import { cva } from "class-variance-authority";

export const progressVariants = cva(
  "h-2 rounded-full transition-all duration-300",
  {
    variants: {
      color: {
        primary: "bg-primary",
        success: "bg-green-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);