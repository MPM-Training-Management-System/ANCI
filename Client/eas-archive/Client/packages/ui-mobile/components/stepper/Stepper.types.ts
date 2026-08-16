import { StyleProp, ViewStyle } from "react-native";

export interface StepperProps {
  currentStep: number;

  totalSteps: number;

  title: string;

  subtitle?: string;

  containerStyle?: StyleProp<ViewStyle>;
}