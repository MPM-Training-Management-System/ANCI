import { cva } from "class-variance-authority";

export const paginationButtonVariants = cva(
  [
    "flex",
    "h-9",
    "min-w-9",
    "items-center",
    "justify-center",
    "rounded-md",
    "border",
    "text-sm",
    "transition-all",
  ].join(" "),
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground border-primary",
        false:
          "bg-background hover:bg-muted border-border",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);