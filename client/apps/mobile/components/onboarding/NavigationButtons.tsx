import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  currentIndex: number;
  total: number;
  onSkip: () => void;
  onNext: () => void;
  onGetStarted: () => void;
};

export default function NavigationButtons({
  currentIndex,
  total,
  onSkip,
  onNext,
  onGetStarted,
}: Props) {
  const isLastPage = currentIndex === total - 1;

  return (
    <View style={styles.container}>
      {!isLastPage ? (
        <>
          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipText}>
              Skip
            </Text>
          </Pressable>

          <Pressable
            style={styles.nextButton}
            onPress={onNext}
          >
            <Text style={styles.nextText}>
              Next
            </Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          style={styles.getStartedButton}
          onPress={onGetStarted}
        >
          <Text style={styles.getStartedText}>
            Get Started
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 24,

    marginBottom: 40,
  },

  skipButton: {
    paddingHorizontal: 20,

    paddingVertical: 12,
  },

  skipText: {
    color: "#F7F9FB",

    fontSize: 16,

    fontWeight: "600",
  },

  nextButton: {
    backgroundColor: "#6FD1D7",

    paddingHorizontal: 26,

    paddingVertical: 14,

    borderRadius: 999,
  },

  nextText: {
    color: "#002B5C",

    fontSize: 16,

    fontWeight: "700",
  },

  getStartedButton: {
    flex: 1,

    backgroundColor: "#6FD1D7",

    justifyContent: "center",

    alignItems: "center",

    paddingVertical: 16,

    borderRadius: 999,
  },

  getStartedText: {
    color: "#002B5C",

    fontSize: 17,

    fontWeight: "700",
  },
});