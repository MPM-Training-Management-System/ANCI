import { StyleSheet } from "react-native";

import {
  colors,
  spacing,
} from "@repo/token";

export const styles = StyleSheet.create({

  container:{

    flexDirection:"row",

    alignItems:"center",

    paddingVertical:spacing.md,

    paddingHorizontal:spacing.lg,

    backgroundColor:colors.surface,

  },

  left:{
    marginRight:spacing.md,
  },

  content:{
    flex:1,
  },

  right:{
    marginLeft:spacing.md,
  },

  disabled:{
    opacity:.5,
  },

});