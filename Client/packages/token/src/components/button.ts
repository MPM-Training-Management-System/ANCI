export const buttonStyles = {
  base:
    "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",

  variants: {
    primary:
      "bg-secondary text-white hover:opacity-90",

    secondary:
      "bg-surface border border-outline text-on-surface hover:bg-surface-container",

    danger:
      "bg-error text-on-error hover:opacity-90",

    ghost:
      "bg-transparent text-on-surface hover:bg-surface-container",

    outline:
      "border border-outline bg-transparent text-on-surface hover:bg-surface-container",
  },

  sizes: {
    sm: "h-8 px-3",
    md: "h-10 px-4",
    lg: "h-12 px-6",
    icon: "h-10 w-10",
  },
} as const;