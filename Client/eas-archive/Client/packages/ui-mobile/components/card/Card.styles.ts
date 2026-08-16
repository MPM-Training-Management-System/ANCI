import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
} from "@repo/token";

export const styles = StyleSheet.create({

  card:{

    backgroundColor:colors.surface,

    borderRadius:radius.xl,

    padding:spacing.lg,

  },

  elevated:{

    elevation:4,

    shadowColor:"#000",

    shadowOpacity:.1,

    shadowRadius:8,

    shadowOffset:{
      width:0,
      height:4,
    },

  },

  outlined:{

    borderWidth:1,

    borderColor:colors.background,

  },

  header:{
    marginBottom:spacing.md,
  },

  content:{
    marginBottom:spacing.md,
  },

  footer:{
    marginTop:spacing.md,
  }

});