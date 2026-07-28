import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@repo/token";

export const styles = StyleSheet.create({

  container:{
    width:"100%",
  },

  label:{
    ...typography.bodySm,
    color:colors.onSurface,
    marginBottom:spacing.xs,
    fontWeight:"600",
  },

  inputContainer:{

    flexDirection:"row",

    alignItems:"center",

    borderWidth:1,

    borderColor:colors.background,

    borderRadius:radius.lg,

    backgroundColor:colors.surface,

    paddingHorizontal:spacing.md,

    minHeight:52,

  },

  input:{

    flex:1,

    ...typography.bodyMd,

    color:colors.onSurface,

    paddingVertical:12,

  },

  helper:{

    marginTop:6,

    ...typography.bodySm,

    color:colors.onSurfaceVariant,

  },

  error:{

    marginTop:6,

    ...typography.bodySm,

    color:colors.error,

  },

  focused:{
    borderColor:colors.primary,
  },

  disabled:{
    opacity:.5,
  }

});