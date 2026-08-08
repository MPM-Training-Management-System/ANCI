import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import GradientBackground from "@/components/splash/AnimatedGradient";
import AnimatedLogo from "@/components/splash/AnimatedLogo";
import AnimatedTitle from "@/components/splash/AnimatedTitle";
import BackgroundParticles from "@/components/splash/BackgroundParticles";
import Ripple from "@/components/splash/Ripple";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>

      {/* Animated Gradient */}
      <GradientBackground />

      {/* Floating Particles */}
      <BackgroundParticles />

      {/* Ripple Effect */}
     

      {/* Main Content */}
      <View style={styles.content}>
        <AnimatedLogo />

        <AnimatedTitle />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    overflow: "hidden",

    justifyContent: "center",

    alignItems: "center",

  },

  content: {

    justifyContent: "center",

    alignItems: "center",

    zIndex: 100,

  },

});