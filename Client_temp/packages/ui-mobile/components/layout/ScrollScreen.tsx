import { ScrollView } from "react-native";

import { colors, spacing } from "@repo/token";

import type { LayoutProps } from "./layout.types";

export function ScrollScreen({
  children,
  style,
  ...props
}: LayoutProps) {
  return (
    <ScrollView
      {...props}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        {
          flexGrow: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
}