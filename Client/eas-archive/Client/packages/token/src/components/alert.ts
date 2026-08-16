// packages/token/src/styles/alert.ts
export const alertStyles = {
  base:
    "flex items-start gap-3 rounded-lg border p-4 text-sm",

  variants: {
    info:
      "border-outline-variant bg-surface-container-low text-on-surface",
    success:
      "border-secondary bg-secondary-container/40 text-on-secondary-container",
    warning:
      "border-warning bg-warning/10 text-on-surface",
    error:
      "border-error bg-error-container text-on-error-container",
  },
} as const;