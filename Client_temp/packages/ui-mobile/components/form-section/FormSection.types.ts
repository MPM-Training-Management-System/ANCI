import type { StyleProp, ViewStyle } from "react-native";

export interface FormSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}