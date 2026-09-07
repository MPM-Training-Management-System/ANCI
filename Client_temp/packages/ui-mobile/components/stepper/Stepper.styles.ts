import { StyleSheet } from "react-native";

import {
  colors,
  spacing,
  radius,
} from "@repo/token";

export const styles = StyleSheet.create({

  container: {
    width: "100%",
    marginBottom: spacing.xl,
  },

  header: {
    marginBottom: spacing.md,
  },

  title: {
    marginTop: spacing.xs,
  },

  indicatorContainer: {

    flexDirection: "row",

    gap: spacing.xs,

    alignItems: "center",

  },

  step: {

    flex: 1,

    height: 6,

    borderRadius: radius.full,

    backgroundColor: colors.surface,

  },

  activeStep: {

    backgroundColor: colors.primary,

  },

});