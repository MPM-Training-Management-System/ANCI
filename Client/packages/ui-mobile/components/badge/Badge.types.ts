import type { ReactNode } from "react";
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export type BadgeSize =
  | "sm"
  | "md"
  | "lg";

export interface BadgeProps {

  children: ReactNode;

  variant?: BadgeVariant;

  size?: BadgeSize;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  style?: StyleProp<ViewStyle>;

  textStyle?: StyleProp<TextStyle>;

}