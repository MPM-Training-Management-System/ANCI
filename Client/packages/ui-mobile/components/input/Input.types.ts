import type { ReactNode } from "react";

import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface InputProps
  extends TextInputProps {

  label?: string;

  helperText?: string;

  error?: string;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  containerStyle?: StyleProp<ViewStyle>;

  inputStyle?: StyleProp<TextStyle>;

}