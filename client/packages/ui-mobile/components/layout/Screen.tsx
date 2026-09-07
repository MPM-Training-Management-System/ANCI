import { View } from "react-native";

import { colors, spacing } from "@repo/token";

import type { LayoutProps } from "./layout.types";

export function Screen({
  children,
  style,
  ...props
}: LayoutProps) {
  return (
    <View
      {...props}
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}