import {
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface CheckboxProps extends PressableProps {
  label?: string;

  helperText?: string;

  error?: string;

  checked?: boolean;

  disabled?: boolean;

  containerStyle?: StyleProp<ViewStyle>;

  checkboxStyle?: StyleProp<ViewStyle>;

  onCheckedChange?: (checked: boolean) => void;
}