import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
} from "@repo/token";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    marginBottom: spacing.xs,
  },

  inputContainer: {
  minHeight: 56,

  flexDirection: "row",

  alignItems: "center",

  borderRadius: radius.lg,

  borderWidth: 1,

  borderColor: colors.onSurface,

  backgroundColor: colors.surface,

  paddingHorizontal: 16,
},

  input: {
    flex: 1,

    color: colors.onSurface,

    paddingVertical: 0,
  },

  helper: {
    marginTop: spacing.xs,

    color: colors.secondary,
  },

  errorText: {
    marginTop: spacing.xs,

    color: colors.error,
  },

  error: {
    borderColor: colors.error,
  },

  disabled: {
    opacity: .5,
  },

  leftIcon: {
    justifyContent: "center",

    alignItems: "center",
  },

  rightIcon: {
    justifyContent: "center",

    alignItems: "center",
  },

  /* ---------- Variants ---------- */

  outlined: {
    backgroundColor: colors.background,

    borderWidth: 1,

    borderColor: colors.onSurface,
  },

  filled: {
    backgroundColor: colors.onSurface,

    borderWidth: 0,
  },

  underlined: {
    backgroundColor: "transparent",

    borderWidth: 0,

    borderBottomWidth: 1,

    borderRadius: 0,

    borderColor: colors.primary,
  },

  /* ---------- Sizes ---------- */

  sm: {
    minHeight: 40,
  },

  md: {
    minHeight: 52,
  },

  lg: {
    minHeight: 60,
  },

  inputSm: {
    fontSize: 14,
  },

  inputMd: {
    fontSize: 16,
  },

  inputLg: {
    fontSize: 18,
  },
});