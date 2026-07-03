// packages/token/src/styles/badge.ts
export const badgeStyles = {
  base:
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",

  variants: {
    success:
      "bg-secondary-container text-on-secondary-container",
    warning:
      "bg-warning/15 text-warning",
    error:
      "bg-error-container text-on-error-container",
    neutral:
      "bg-surface-container text-on-surface-variant",
  },
} as const;