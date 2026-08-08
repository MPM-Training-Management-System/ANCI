import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Input,
} from "@repo/ui-mobile";

export default function AccountStep() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [agreePrivacy, setAgreePrivacy] =
    useState(false);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Input
        label="Username"
        helperText="Optional"
        value={username}
        onChangeText={setUsername}
        placeholder="johndoe"
        leftIcon={
          <Ionicons
            name="person-outline"
            size={20}
            color="#64748B"
          />
        }
      />

      <Input
        label="Password"
        required
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry={!showPassword}
        leftIcon={
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#64748B"
          />
        }
        rightIcon={
          <Pressable
            onPress={() =>
              setShowPassword(!showPassword)
            }
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-outline"
                  : "eye-off-outline"
              }
              size={20}
              color="#64748B"
            />
          </Pressable>
        }
      />

      <Input
        label="Confirm Password"
        required
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry={!showConfirmPassword}
        leftIcon={
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#64748B"
          />
        }
        rightIcon={
          <Pressable
            onPress={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            <Ionicons
              name={
                showConfirmPassword
                  ? "eye-outline"
                  : "eye-off-outline"
              }
              size={20}
              color="#64748B"
            />
          </Pressable>
        }
      />

      <View style={styles.divider} />

      <Pressable
        style={styles.checkboxRow}
        onPress={() =>
          setAgreeTerms(!agreeTerms)
        }
      >
        <Ionicons
          name={
            agreeTerms
              ? "checkbox"
              : "square-outline"
          }
          size={22}
          color="#2563EB"
        />

        <Text style={styles.checkboxText}>
          I agree to the
          <Text style={styles.link}>
            {" "}
            Terms and Conditions
          </Text>
        </Text>
      </Pressable>

      <Pressable
        style={styles.checkboxRow}
        onPress={() =>
          setAgreePrivacy(!agreePrivacy)
        }
      >
        <Ionicons
          name={
            agreePrivacy
              ? "checkbox"
              : "square-outline"
          }
          size={22}
          color="#2563EB"
        />

        <Text style={styles.checkboxText}>
          I agree to the
          <Text style={styles.link}>
            {" "}
            Privacy Policy
          </Text>
        </Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle"
          size={22}
          color="#2563EB"
        />

        <Text style={styles.infoText}>
          Your account will be reviewed by the
          administrator before it is activated.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 40,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkboxText: {
    flex: 1,
    marginLeft: 10,
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },

  link: {
    color: "#2563EB",
    fontWeight: "700",
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#1E40AF",
    lineHeight: 20,
  },
});