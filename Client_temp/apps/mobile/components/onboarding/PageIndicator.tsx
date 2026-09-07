import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  currentIndex: number;
  total: number;
};

type DotProps = {
  active: boolean;
};

function Dot({ active }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: active ? 28 : 10,

      backgroundColor: interpolateColor(
        active ? 1 : 0,
        [0, 1],
        ["rgba(255,255,255,.35)", "#6FD1D7"]
      ),
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
}

export default function PageIndicator({
  currentIndex,
  total,
}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({
        length: total,
      }).map((_, index) => (
        <Dot
          key={index}
          active={index === currentIndex}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    gap: 10,

    marginBottom: 28,
  },

  dot: {
    width: 10,

    height: 10,

    borderRadius: 999,

    backgroundColor: "rgba(255,255,255,.35)",
  },
});