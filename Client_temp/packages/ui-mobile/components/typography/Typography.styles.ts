import { StyleSheet } from "react-native";

import {
  colors,
  typography,
} from "@repo/token";

export const styles = StyleSheet.create({

  displayLg: {
    ...typography.displayLg,
    color: colors.onSurface,
  },

  headlineMd: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },

  titleSm: {
    ...typography.titleSm,
    color: colors.onSurface,
  },

  bodyMd: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  bodySm: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },

  labelCaps: {
    ...typography.labelCaps,
    color: colors.onSurface,
    textTransform: "uppercase",
  },

  codeTable: {
    ...typography.codeTable,
    color: colors.primary,
  },

});