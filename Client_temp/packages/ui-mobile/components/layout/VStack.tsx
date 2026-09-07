import { View } from "react-native";

import { spacing as tokenSpacing } from "@repo/token";

import type { LayoutProps } from "./layout.types";

export function VStack({
  children,
  style,
  spacing = tokenSpacing.md,
  align,
  justify,
  wrap,
}: LayoutProps) {
  return (
    <View
      style={[
        {
          gap: spacing,
          flexDirection: "column",
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}