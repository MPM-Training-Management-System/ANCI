import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@repo/token";

import type { LayoutProps } from "./layout.types";

export function SafeArea({
  children,
  style,
}: LayoutProps) {
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}