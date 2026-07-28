import { StyleSheet } from "react-native";

import {
  colors,
  spacing,
  radius,
} from "@repo/token";

export const styles = StyleSheet.create({

  chip:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",

    paddingHorizontal:spacing.md,
    paddingVertical:spacing.sm,

    borderRadius:radius.full,

    borderWidth:1,

    borderColor:colors.primary,

    backgroundColor:colors.surface,

    gap:spacing.xs,
  },

  selected:{
    backgroundColor:colors.primary,
    borderColor:colors.primary,
  },

  text:{
    color:colors.onSurface,
    fontWeight:"600",
  },

  selectedText:{
    color:colors.onPrimary,
  },

});