import { View } from "react-native";

interface Props {
  size?: number;
}

export function Spacer({
  size = 16,
}: Props) {
  return (
    <View
      style={{
        height: size,
        width: size,
      }}
    />
  );
}