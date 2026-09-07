import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface ChipProps
  extends PressableProps {

  label: string;

  selected?: boolean;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  style?: StyleProp<ViewStyle>;

}