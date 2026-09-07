// packages/token/src/styles/table.ts
export const tableStyles = {
  header:
    "bg-surface-container-low text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant",

  row:
    "h-12 border-b border-outline-variant hover:bg-secondary-container/10 transition-colors",

  rowCompact: "h-10",

  cell: "px-4 py-3 text-sm text-on-surface",
} as const;