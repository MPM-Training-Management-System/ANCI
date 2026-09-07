import { View } from "react-native";

import { Caption } from "../typography";

import { styles } from "./Badge.styles";

import type {
  BadgeProps,
  BadgeVariant,
} from "./Badge.types";

const textVariants = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  success: styles.successText,
  warning: styles.warningText,
  danger: styles.dangerText,
  info: styles.infoText,
  neutral: styles.neutralText,
};

export function Badge({

  children,

  variant="primary",

  size="md",

  leftIcon,

  rightIcon,

  style,

  textStyle,

}:BadgeProps){

  return(

    <View
      style={[
        styles.badge,
        styles[size],
        styles[variant],
        style,
      ]}
    >

      {leftIcon}

      <Caption
        style={[
          styles.text,
          textVariants[
            variant as BadgeVariant
          ],
          textStyle,
        ]}
      >
        {children}
      </Caption>

      {rightIcon}

    </View>

  );

}