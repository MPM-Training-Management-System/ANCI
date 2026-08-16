import React from "react";

import {
  View,
} from "react-native";

import { styles } from "./Stepper.styles";

interface StepProps {
  active: boolean;
}

export function Step({
  active,
}: StepProps) {
  return (
    <View
      style={[
        styles.step,
        active && styles.activeStep,
      ]}
    />
  );
}