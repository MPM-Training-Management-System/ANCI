import type {
  StyleProp,
  TextProps,
  TextStyle,
} from "react-native";

import type { ReactNode } from "react";

export type TypographyVariant =
  | "displayLg"
  | "headlineMd"
  | "titleSm"
  | "bodyMd"
  | "bodySm"
  | "labelCaps"
  | "codeTable";

export interface TypographyProps extends TextProps {
  children: ReactNode;

  /**
   * Typography Variant
   */
  variant?: TypographyVariant;

  /**
   * Override text color
   */
  color?: string;

  /**
   * Text Alignment
   */
  align?: "auto" | "left" | "right" | "center" | "justify";

  style?: StyleProp<TextStyle>;
}