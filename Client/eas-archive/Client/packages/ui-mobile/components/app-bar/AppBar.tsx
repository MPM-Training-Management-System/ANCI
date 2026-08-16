import React from "react";

import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  Body,
  Title,
} from "../typography";

import { styles } from "./AppBar.styles";

import type {
  AppBarProps,
} from "./AppBar.types";

export function AppBar({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  left,
  right,
  image,
}: AppBarProps) {
  return (
    <View style={styles.container}>

      {/* TOP BAR */}

      <View style={styles.topRow}>

        {showBackButton ? (
          <Pressable
            onPress={onBackPress}
            style={styles.backButton}
          >
            <Text
              style={{
                fontSize: 20,
              }}
            >
              ←
            </Text>
          </Pressable>
        ) : (
          left
        )}

        {right}

      </View>

      {/* CONTENT */}

      <View style={styles.content}>

        {/* OPTIONAL IMAGE */}

        {image && (
          <Image
            source={image}
            resizeMode="contain"
            style={styles.image}
          />
        )}

        {/* TITLE */}

        {title && (
          <Title
            style={styles.title}
          >
            {title}
          </Title>
        )}

        {/* SUBTITLE */}

        {subtitle && (
          <Body
            style={styles.subtitle}
          >
            {subtitle}
          </Body>
        )}

      </View>

    </View>
  );
}