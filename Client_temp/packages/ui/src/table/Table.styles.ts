import { cva } from "class-variance-authority";

export const tableWrapperVariants = cva(
  "overflow-hidden rounded-xl border border-border bg-background shadow-sm"
);

export const tableVariants = cva(
  "w-full border-collapse"
);

export const tableHeaderVariants = cva(
  "border-b bg-muted/50"
);

export const tableHeadVariants = cva(
  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
);

export const tableRowVariants = cva(
  "border-b transition-colors hover:bg-muted/40"
);

export const tableCellVariants = cva(
  "px-6 py-5 align-middle"
);