import {
  Pressable,
} from "react-native";

import { Body } from "../typography";

import { styles } from "./Button.styles";

import type {
  ButtonProps,
  ButtonVariant,
} from "./Button.types";

const variantText = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  outline: styles.outlineText,
  ghost: styles.ghostText,
  danger: styles.dangerText,
};

export function Button({
  children,

  variant = "primary",

  size = "md",

  loading = false,

  disabled = false,

  leftIcon,

  rightIcon,

  style,

  textStyle,

  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[size],
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <Body
          style={[
            styles.text,
            variantText[
              variant as ButtonVariant
            ],
            textStyle,
          ]}
        >
          Loading...
        </Body>
      ) : (
        <>
          {leftIcon}

          <Body
            style={[
              styles.text,
              variantText[
                variant as ButtonVariant
              ],
              textStyle,
            ]}
          >
            {children}
          </Body>

          {rightIcon}
        </>
      )}
    </Pressable>
  );
}