import { StyleSheet } from "react-native";

import { colors } from "@repo/token";

export const styles = StyleSheet.create({

  avatar:{

    justifyContent:"center",

    alignItems:"center",

    overflow:"hidden",

    backgroundColor:colors.primaryContainer,

  },

  image:{
    width:"100%",
    height:"100%",
  },

  text:{
    color:colors.onPrimaryContainer,
    fontWeight:"700",
  },

  xs:{
    width:28,
    height:28,
    borderRadius:14,
  },

  sm:{
    width:36,
    height:36,
    borderRadius:18,
  },

  md:{
    width:48,
    height:48,
    borderRadius:24,
  },

  lg:{
    width:64,
    height:64,
    borderRadius:32,
  },

  xl:{
    width:96,
    height:96,
    borderRadius:48,
  },

});