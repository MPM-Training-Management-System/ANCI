// packages/token/src/styles/input.ts
export const inputStyles = {
  base:
    "h-10 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface placeholder:text-on-surface-variant transition-colors focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",

  states: {
    error: "border-2 border-error",
    valid: "border-secondary",
  },
} as const;