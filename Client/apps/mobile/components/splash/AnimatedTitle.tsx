import React, { useEffect } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  Easing,
  FadeInDown,
} from "react-native-reanimated";

const TITLE = "ACE NEXTGEN";

export default function AnimatedTitle() {
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TITLE.split("").map((letter, index) => (
          <Animated.Text
            key={index}
            entering={FadeInDown
              .delay(900 + index * 80)
              .duration(450)
              .easing(Easing.out(Easing.exp))}
            style={styles.title}
          >
            {letter === " " ? "\u00A0" : letter}
          </Animated.Text>
        ))}
      </View>

      <Animated.Text
        entering={FadeInDown
          .delay(2000)
          .duration(700)}
        style={styles.subtitle}
      >
        Training Management System
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({

  container:{

    alignItems:"center",

    marginTop:45,

  },

  row:{

    flexDirection:"row",

    flexWrap:"wrap",

    justifyContent:"center",

  },

  title:{

    fontSize:34,

    fontWeight:"800",

    color:"#FFFFFF",

    letterSpacing:2,

  },

  subtitle:{

    marginTop:10,

    fontSize:16,

    color:"rgba(255,255,255,.82)",

    letterSpacing:.8,

  }

});