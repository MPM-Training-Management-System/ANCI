import React, { forwardRef } from "react";

import {
  ActivityIndicator,
  TextInput,
  View,
} from "react-native";

import { colors } from "@repo/token";

import {
  Body,
  Caption,
  Label,
} from "../typography";

import { styles } from "./Input.styles";

import type {
  InputProps,
} from "./Input.types";

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      variant = "outlined",
      size = "md",
      containerStyle,
      inputContainerStyle,
      inputStyle,
      editable = true,
      ...props
    },
    ref
  ) => {

    const variantStyles = {
      outlined: styles.outlined,
      filled: styles.filled,
      underlined: styles.underlined,
    };

    const sizeStyles = {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    };

    const inputSizeStyles = {
      sm: styles.inputSm,
      md: styles.inputMd,
      lg: styles.inputLg,
    };

    return (
      <View
        style={[
          styles.container,
          containerStyle,
        ]}
      >
        {label && (
          <Label style={styles.label}>
            {label}

            {required && (
              <Body
                style={{
                  color: colors.error,
                }}
              >
                {" *"}
              </Body>
            )}
          </Label>
        )}

        <View
          style={[
            styles.inputContainer,
            variantStyles[variant],
            sizeStyles[size],
            disabled && styles.disabled,
            error && styles.error,
            inputContainerStyle,
          ]}
        >
          {leftIcon && (
            <View style={styles.leftIcon}>
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            editable={!disabled && editable}
            placeholderTextColor={colors.surface}
            style={[
              styles.input,
              inputSizeStyles[size],
              inputStyle,
              {
      outlineStyle: "none",
    } as any,
            ]}
            {...props}
          />

          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            rightIcon && (
              <View style={styles.rightIcon}>
                {rightIcon}
              </View>
            )
          )}
        </View>

        {error ? (
          <Caption style={styles.errorText}>
            {error}
          </Caption>
        ) : helperText ? (
          <Caption style={styles.helper}>
            {helperText}
          </Caption>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";