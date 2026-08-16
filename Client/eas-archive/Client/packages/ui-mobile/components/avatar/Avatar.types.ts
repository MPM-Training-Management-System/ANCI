import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

export type AvatarSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface AvatarProps {

  source?: ImageSourcePropType;

  name?: string;

  size?: AvatarSize;

  rounded?: boolean;

  style?: StyleProp<ViewStyle>;

}