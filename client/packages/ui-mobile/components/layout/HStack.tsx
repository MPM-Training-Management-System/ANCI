import { View } from "react-native";

import { spacing as tokenSpacing } from "@repo/token";

import type { LayoutProps } from "./layout.types";

export function HStack({
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
          flexDirection: "row",
          gap: spacing,
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