import type { ReactNode } from "react";
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export type InputVariant =
  | "outlined"
  | "filled"
  | "underlined";

export type InputSize =
  | "sm"
  | "md"
  | "lg";

export interface InputProps extends TextInputProps {
  /**
   * Label above input
   */
  label?: string;

  /**
   * Helper text below input
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Required field
   */
  required?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Left icon
   */
  leftIcon?: ReactNode;

  /**
   * Right icon
   */
  rightIcon?: ReactNode;

  /**
   * outlined | filled | underlined
   */
  variant?: InputVariant;

  /**
   * sm | md | lg
   */
  size?: InputSize;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Input wrapper style
   */
  inputContainerStyle?: StyleProp<ViewStyle>;

  /**
   * TextInput style
   */
  inputStyle?: StyleProp<TextStyle>;
}