import { StyleSheet } from "react-native";

import {
  colors,
  spacing,
} from "@repo/token";

export const styles = StyleSheet.create({

  container: {

    width: "100%",

    paddingTop: spacing.md,

    paddingBottom: spacing.lg,

  },

  topRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: spacing.lg,

  },

  backButton: {

    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: colors.surface,

  },

 content: {
  alignItems: "center",

  justifyContent: "center",

  gap: spacing.sm,

  width: "100%",
},

title: {

  textAlign: "center",

},

subtitle: {

  textAlign: "center",

},

});