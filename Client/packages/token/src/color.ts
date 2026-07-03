export const colors = {
  // Surface
  surface: "#f7f9fb",
  surfaceDim: "#d8dadc",
  surfaceBright: "#f7f9fb",

  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainer: "#eceef0",
  surfaceContainerHigh: "#e6e8ea",
  surfaceContainerHighest: "#e0e3e5",

  // Text
  onSurface: "#191c1e",
  onSurfaceVariant: "#44474e",

  inverseSurface: "#2d3133",
  inverseOnSurface: "#eff1f3",

  // Borders
  outline: "#75777f",
  outlineVariant: "#c5c6cf",

  // Branding
  primary: "#000a21",
  onPrimary: "#ffffff",

  primaryContainer: "#0d2142",
  onPrimaryContainer: "#7789b0",

  inversePrimary: "#b5c6f0",

  secondary: "#006b5f",
  onSecondary: "#ffffff",

  secondaryContainer: "#62fae3",
  onSecondaryContainer: "#007165",

  tertiary: "#000b1b",
  onTertiary: "#ffffff",

  tertiaryContainer: "#122236",
  onTertiaryContainer: "#7a8aa2",

  // Semantic
  success: "#006b5f",
  warning: "#F59E0B",

  error: "#ba1a1a",
  onError: "#ffffff",

  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  // Background
  background: "#f7f9fb",
  onBackground: "#191c1e",

  surfaceVariant: "#e0e3e5",
} as const;

export type ColorToken = keyof typeof colors;