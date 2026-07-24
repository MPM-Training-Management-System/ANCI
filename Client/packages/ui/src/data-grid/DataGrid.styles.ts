import { cva } from "class-variance-authority";

export const dataGridVariants = cva(
  "rounded-xl border border-border bg-background shadow-sm overflow-hidden"
);

export const toolbarVariants = cva(
  "flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between"
);

export const contentVariants = cva(
  "overflow-x-auto"
);

export const footerVariants = cva(
  "border-t"
);