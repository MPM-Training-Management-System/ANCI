import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@repo/token";

export const styles = StyleSheet.create({

  button:{

    flexDirection:"row",

    justifyContent:"center",

    alignItems:"center",

    borderRadius:radius.lg,

    gap:spacing.sm,

  },

  text:{
    ...typography.bodyMd,
    fontWeight:"600",
  },

  sm:{
    paddingHorizontal:16,
    paddingVertical:10,
  },

  md:{
    paddingHorizontal:20,
    paddingVertical:14,
  },

  lg:{
    paddingHorizontal:24,
    paddingVertical:18,
  },

  primary:{
    backgroundColor:colors.primary,
  },

  secondary:{
    backgroundColor:colors.secondary,
  },

  outline:{
    borderWidth:1,
    borderColor:colors.primary,
    backgroundColor:"transparent",
  },

  ghost:{
    backgroundColor:"transparent",
  },

  danger:{
    backgroundColor:colors.error,
  },

  primaryText:{
    color:colors.onPrimary,
  },

  secondaryText:{
    color:colors.onSecondary,
  },

  outlineText:{
    color:colors.primary,
  },

  ghostText:{
    color:colors.primary,
  },

  dangerText:{
    color:colors.error,
  },

  disabled:{
    opacity:.5,
  }

});