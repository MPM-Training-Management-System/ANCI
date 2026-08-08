import React from "react";

import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

type Props = {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  background: [string, string];
};

export default function OnboardingCard({
  title,
  subtitle,
  image,
  background,
}: Props) {
  return (
    <LinearGradient
      colors={background}
      style={styles.container}
    >
      {/* Illustration */}

      <Animated.View
        entering={FadeInDown.duration(700)}
        style={styles.imageContainer}
      >
        <Image
          source={image}
          resizeMode="contain"
          style={styles.image}
        />
      </Animated.View>

      {/* Glass Card */}

      <Animated.View
        entering={FadeInUp.delay(300).duration(700)}
        style={styles.card}
      >
        <Animated.Text
          entering={FadeInUp.delay(500).duration(600)}
          style={styles.title}
        >
          {title}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.subtitle}
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 24,
  },

  imageContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  image: {
    width: 300,

    height: 300,
  },

  card: {
    width: "100%",

    backgroundColor: "rgba(255,255,255,0.15)",

    borderRadius: 28,

    padding: 24,

    marginBottom: 60,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,.25)",
  },

  title: {
    fontSize: 32,

    fontWeight: "800",

    color: "#FFFFFF",

    textAlign: "center",
  },

  subtitle: {
    marginTop: 18,

    fontSize: 16,

    lineHeight: 24,

    color: "#F7F9FB",

    textAlign: "center",
  },
});