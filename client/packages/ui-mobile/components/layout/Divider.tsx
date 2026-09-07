import { View } from "react-native";

import { colors } from "@repo/token";

export function Divider() {
  return (
    <View
      style={{
        height: 1,
        width: "100%",
        backgroundColor: colors.background,
      }}
    />
  );
}