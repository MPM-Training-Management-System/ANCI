import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  label: string;
  index: number;
  selected: boolean;
  onPress: () => void;
}

export default function AnswerOption({
  label,
  index,
  selected,
  onPress,
}: Props) {
  const letter =
    String.fromCharCode(
      65 + index
    );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected &&
          styles.selectedContainer,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.radio,
          selected &&
            styles.selectedRadio,
        ]}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={12}
            color="#FFFFFF"
          />
        )}
      </View>

      <View style={styles.letter}>
        <Text
          style={[
            styles.letterText,
            selected &&
              styles.selectedLetterText,
          ]}
        >
          {letter}
        </Text>
      </View>

      <Text
        style={[
          styles.text,
          selected &&
            styles.selectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  selectedContainer: {
    borderColor: "#2563EB",
    backgroundColor: "#EEF4FF",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRadio: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },

  letter: {
    width: 27,
    height: 27,
    marginLeft: 9,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  letterText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
  },

  selectedLetterText: {
    color: "#2563EB",
  },

  text: {
    flex: 1,
    marginLeft: 9,
    fontSize: 9,
    lineHeight: 14,
    color: "#475569",
  },

  selectedText: {
    fontWeight: "700",
    color: "#1E40AF",
  },

  pressed: {
    opacity: 0.72,
  },
});