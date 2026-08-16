import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface ListItemProps
  extends PressableProps {

  title: string;

  subtitle?: string;

  description?: string;

  left?: ReactNode;

  right?: ReactNode;

  disabled?: boolean;

  style?: StyleProp<ViewStyle>;

}