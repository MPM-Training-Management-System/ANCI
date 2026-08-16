import { View } from "react-native";

import type { LayoutProps } from "./layout.types";

export function Container({
  children,
  style,
  ...props
}: LayoutProps) {
  return (
    <View
      {...props}
      style={[
        {
          width: "100%",
          alignSelf: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}