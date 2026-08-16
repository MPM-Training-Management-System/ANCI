import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@repo/token";

export const styles = StyleSheet.create({

  container: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 22,
    height: 22,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: colors.background,

    borderRadius: radius.sm,

    backgroundColor: colors.surface,
  },

  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  disabled: {
    opacity: .5,
  },

  label: {
    marginLeft: spacing.sm,

    flex: 1,

    ...typography.bodySm,

    color: colors.onSurface,
  },

  helper: {
    marginTop: spacing.xs,
    marginLeft: 30,

    ...typography.bodySm,

    color: colors.onSurfaceVariant,
  },

  error: {
    marginTop: spacing.xs,
    marginLeft: 30,

    ...typography.bodySm,

    color: colors.error,
  },

});