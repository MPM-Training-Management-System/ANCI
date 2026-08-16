import { cva } from "class-variance-authority";

export const searchBoxVariants = cva(
  [
    "w-full",
    "rounded-lg",
    "border",
    "bg-background",
    "pl-10",
    "pr-4",
    "py-2.5",
    "text-sm",
    "outline-none",
    "transition-all",
    "focus:border-primary",
    "focus:ring-2",
    "focus:ring-primary/20",
  ].join(" ")
);