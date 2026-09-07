import { Text } from "react-native";

import { styles } from "./Typography.styles";
import type {
  TypographyProps,
  TypographyVariant,
} from "./Typography.types";

const variantStyles: Record<
  TypographyVariant,
  object
> = {

  displayLg: styles.displayLg,

  headlineMd: styles.headlineMd,

  titleSm: styles.titleSm,

  bodyMd: styles.bodyMd,

  bodySm: styles.bodySm,

  labelCaps: styles.labelCaps,

  codeTable: styles.codeTable,

};

export function Typography({

  children,

  variant = "bodyMd",

  color,

  align,

  style,

  ...props

}: TypographyProps) {

  return (

    <Text
      {...props}
      style={[
        variantStyles[variant],

        color && {
          color,
        },

        align && {
          textAlign: align,
        },

        style,
      ]}
    >
      {children}
    </Text>

  );

}