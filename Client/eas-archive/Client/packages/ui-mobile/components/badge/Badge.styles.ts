import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@repo/token";

export const styles = StyleSheet.create({

  badge:{
    flexDirection:"row",
    alignItems:"center",
    alignSelf:"flex-start",
    borderRadius:radius.full,
    gap:spacing.xs,
  },

  text:{
    ...typography.bodySm,
    fontWeight:"600",
  },

  sm:{
    paddingHorizontal:8,
    paddingVertical:2,
  },

  md:{
    paddingHorizontal:10,
    paddingVertical:4,
  },

  lg:{
    paddingHorizontal:14,
    paddingVertical:6,
  },

  primary:{
    backgroundColor:colors.primaryContainer,
  },

  secondary:{
    backgroundColor:colors.secondary,
  },

  success:{
    backgroundColor:"#DCFCE7",
  },

  warning:{
    backgroundColor:"#FEF3C7",
  },

  danger:{
    backgroundColor:"#FEE2E2",
  },

  info:{
    backgroundColor:"#DBEAFE",
  },

  neutral:{
    backgroundColor:colors.surface,
  },

  primaryText:{
    color:colors.onPrimaryContainer,
  },

  secondaryText:{
    color:colors.surfaceContainer,
  },

  successText:{
    color:"#166534",
  },

  warningText:{
    color:"#92400E",
  },

  dangerText:{
    color:"#991B1B",
  },

  infoText:{
    color:"#1D4ED8",
  },

  neutralText:{
    color:colors.onSurfaceVariant,
  },

});