import {
  View,
} from "react-native";

import {
  Body,
  Title,
} from "../typography";

import { styles } from "./FormSection.styles";

import type {
  FormSectionProps,
} from "./FormSection.types";

export function FormSection({
  title,
  subtitle,
  children,
  style,
}: FormSectionProps) {
  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      <View style={styles.header}>
        <Title style={styles.title}>
          {title}
        </Title>

        {subtitle && (
          <Body style={styles.subtitle}>
            {subtitle}
          </Body>
        )}
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}