import React from "react";

import {

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

  showBackButton,

  onBackPress,

  left,

  right,

}: AppBarProps) {

  return (

    <View style={styles.container}>

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

      <View style={styles.content}>

    {/* Logo */}

    <View
        style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#002B5C",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
        }}
    >
        <Text
            style={{
                color: "white",
                fontSize: 28,
            }}
        >
            🛡️
        </Text>
    </View>

    {title && (

        <Title
            style={styles.title}
        >
            {title}
        </Title>

    )}

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