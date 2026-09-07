import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface CardProps
  extends PressableProps {

  children: ReactNode;

  elevated?: boolean;

  outlined?: boolean;

  style?: StyleProp<ViewStyle>;

}