import {
  StyleProp,
  ViewProps,
  ViewStyle,
} from "react-native";

export interface LayoutProps extends ViewProps {
  children: React.ReactNode;

  style?: StyleProp<ViewStyle>;

  spacing?: number;

  align?: ViewStyle["alignItems"];

  justify?: ViewStyle["justifyContent"];

  wrap?: ViewStyle["flexWrap"];
}