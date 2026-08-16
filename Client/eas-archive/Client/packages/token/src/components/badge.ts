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

     admin: "bg-blue-100 text-blue-700",
    trainer: "bg-cyan-100 text-cyan-700",
    participant: "bg-gray-100 text-gray-700",

    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",

  },
} as const;