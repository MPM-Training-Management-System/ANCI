
export const sidebarStyles = {
  container:
    "bg-primary text-white text-sm pt-5 flex h-full flex-col shrink-0",

  header:
    "flex h-16 items-center  border-outline px-6",

  title:
    "text-title-sm font-bold",

  nav:
    "flex-1 space-y-1 px-4 py-6",

  item:
    "relative flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors",

  active:
    "bg-white/10 border-l-3 border-tertiary  transition-colors duration-200 text-tertiary font-semibold",

  inactive:
    "text-onPrimary/70  hover:text-off-white hover:bg-white/5",

  indicator:
    "absolute left-0 top-0 h-full w-1 rounded-r-full bg-secondary",

  footer:
    "border-t border-outline p-4",
} as const;