import React from "react";

import {
  Pressable,
  View,
} from "react-native";

import { colors } from "@repo/token";

import {
  Body,
  Caption,
} from "../typography";

import { styles } from "./Select.styles";
import { SelectOption } from "./Select.types";

interface SelectItemProps<T = string> {
  item: SelectOption<T>;

  selected: boolean;

  selectedIcon?: React.ReactNode;

  onPress: () => void;
}

export function SelectItem<T>({
  item,
  selected,
  selectedIcon,
  onPress,
}: SelectItemProps<T>) {
  return (
    <Pressable
      disabled={item.disabled}
      android_ripple={{
        color: colors.primary + "15",
      }}
      style={({ pressed }) => [
        styles.item,
        selected && styles.selectedItem,
        item.disabled && styles.itemDisabled,
        pressed && {
          opacity: 0.7,
        },
      ]}
      onPress={onPress}
    >
      {item.leftIcon && (
        <View>
          {item.leftIcon}
        </View>
      )}

      <View style={styles.itemContent}>
        <Body>
          {item.label}
        </Body>

        {item.description && (
          <Caption style={styles.itemDescription}>
            {item.description}
          </Caption>
        )}
      </View>

      {selected &&
        (selectedIcon ?? (
          <Body
            style={{
              color: colors.primary,
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            ✓
          </Body>
        ))}
    </Pressable>
  );
}