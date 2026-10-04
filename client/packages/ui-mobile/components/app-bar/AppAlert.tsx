
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type AlertType = "success" | "error" | "warning" | "info";

interface AppAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void;
  onCancel?: () => void;

  showCancel?: boolean;
}

const TYPE_CONFIG = {
  success: {
    icon: "checkmark-circle",
    iconColor: "#16A34A",
    iconBackground: "#DCFCE7",
    buttonColor: "#16A34A",
  },

  error: {
    icon: "close-circle",
    iconColor: "#DC2626",
    iconBackground: "#FEE2E2",
    buttonColor: "#DC2626",
  },

  warning: {
    icon: "warning",
    iconColor: "#D97706",
    iconBackground: "#FEF3C7",
    buttonColor: "#D97706",
  },

  info: {
    icon: "information-circle",
    iconColor: "#2563EB",
    iconBackground: "#DBEAFE",
    buttonColor: "#2563EB",
  },
} as const;

export default function AppAlert({
  visible,
  type = "info",
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
}: AppAlertProps) {
  const config = TYPE_CONFIG[type];

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={showCancel ? handleCancel : undefined}
        />

        <View style={styles.card}>
          {/* ICON */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: config.iconBackground,
              },
            ]}
          >
            <Ionicons
              name={config.icon}
              size={32}
              color={config.iconColor}
            />
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>

            <Text style={styles.message}>
              {message}
            </Text>
          </View>

          {/* ACTIONS */}
          <View
            style={[
              styles.actions,
              !showCancel && styles.singleAction,
            ]}
          >
            {showCancel && (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelText}>
                  {cancelText}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  backgroundColor: config.buttonColor,
                },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.confirmText}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 390,

    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 12,
  },

  iconContainer: {
    width: 64,
    height: 64,

    borderRadius: 32,

    alignItems: "center",
    justifyContent: "center",

    alignSelf: "center",

    marginBottom: 18,
  },

  content: {
    alignItems: "center",
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",

    textAlign: "center",

    letterSpacing: -0.3,
  },

  message: {
    marginTop: 8,

    fontSize: 13,
    lineHeight: 20,

    color: "#64748B",

    textAlign: "center",
  },

  actions: {
    flexDirection: "row",

    gap: 10,

    marginTop: 22,
  },

  singleAction: {
    flexDirection: "column",
  },

  cancelButton: {
    flex: 1,

    height: 48,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F1F5F9",
  },

  confirmButton: {
    flex: 1,

    minHeight: 48,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 18,
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "700",

    color: "#475569",
  },

  confirmText: {
    fontSize: 13,
    fontWeight: "800",

    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});