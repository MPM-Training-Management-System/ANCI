import { useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  Button,
  FormSection,
  Input,
  AppBar
} from "@repo/ui-mobile";

export type AccountSetup = {
  Username: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
};

interface Props {
  form: AccountSetup;

  updateForm: (
    values: Partial<AccountSetup>
  ) => void;

  loading?: boolean;

  onContinue: () => void;
}

export default function AccountStep({
  form,
  updateForm,
  loading = false,
  onContinue,
}: Props) {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const handleContinue = () => {
    if (!form.Username.trim()) {
      Alert.alert(
        "Required",
        "Please enter your username."
      );
      return;
    }

    if (!form.Email.trim()) {
      Alert.alert(
        "Required",
        "Please enter your email address."
      );
      return;
    }

    if (!form.Password) {
      Alert.alert(
        "Required",
        "Please enter your password."
      );
      return;
    }

    if (form.Password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!form.ConfirmPassword) {
      Alert.alert(
        "Required",
        "Please confirm your password."
      );
      return;
    }

    if (
      form.Password !==
      form.ConfirmPassword
    ) {
      Alert.alert(
        "Password Mismatch",
        "Password and Confirm Password do not match."
      );
      return;
    }

    onContinue();
  };
  const handleSignIn = () => {
    if (loading) return;

    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
    

  <AppBar
        title="Create Account"
        subtitle="Set up your account to get started."
        image={require("../../../assets/images/ANCILOGO.png")}
      />
        
      <FormSection
      title="Get Started"
      >
        {/* USERNAME */}

        <Input
          label="Username"
          required
          placeholder="Enter your username"
          value={form.Username}
          onChangeText={(value) =>
            updateForm({
              Username: value,
            })
          }
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View
          style={styles.inputSpacing}
        />

        {/* EMAIL */}

        <Input
          label="Email Address"
          required
          placeholder="example@email.com"
          value={form.Email}
          onChangeText={(value) =>
            updateForm({
              Email: value,
            })
          }
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          leftIcon={
            <Ionicons
              name="mail-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View
          style={styles.inputSpacing}
        />

        {/* PASSWORD */}

        <Input
          label="Password"
          required
          placeholder="Enter your password"
          value={form.Password}
          onChangeText={(value) =>
            updateForm({
              Password: value,
            })
          }
          secureTextEntry={
            !showPassword
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#64748B"
            />
          }
          rightIcon={
            <Pressable
              disabled={loading}
              hitSlop={8}
              onPress={() =>
                setShowPassword(
                  !showPassword
                )
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

        <View
          style={styles.inputSpacing}
        />

        {/* CONFIRM PASSWORD */}

        <Input
          label="Confirm Password"
          required
          placeholder="Re-enter your password"
          value={
            form.ConfirmPassword
          }
          onChangeText={(value) =>
            updateForm({
              ConfirmPassword: value,
            })
          }
          secureTextEntry={
            !showConfirmPassword
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#64748B"
            />
          }
          rightIcon={
            <Pressable
              disabled={loading}
              hitSlop={8}
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

        {/* INFO */}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            After creating your account,
            we will send an OTP to your
            email for verification.
          </Text>
        </View>

        {/* CONTINUE */}

        <Button
          variant="primary"
          loading={loading}
          disabled={loading}
          onPress={handleContinue}
          style={styles.button}
        >
          Continue to Verification
        </Button>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            hitSlop={8}
          >
            <Text style={styles.signIn}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </FormSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    width: "100%",
  },

  inputSpacing: {
    height: 18,
  },

  infoBox: {
    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 24,

    padding: 14,

    borderRadius: 14,

    backgroundColor: "#EEF4FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",
  },

  infoText: {
    flex: 1,

    marginLeft: 10,

    fontSize: 13,

    lineHeight: 20,

    color: "#475569",
  },

  button: {
    marginTop: 24,

    borderRadius: 16,
  },

  footer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 26,
  },

  footerText: {
    color: "#64748B",

    fontSize: 15,
  },

  signIn: {
    marginLeft: 5,

    color: "#2563EB",

    fontWeight: "700",

    fontSize: 15,
  },
});