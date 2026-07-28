import { useState } from "react";
import {
  Alert,
  Pressable,
  Switch,
} from "react-native";

import {
  Body,
  Button,
  Card,
  Divider,
  H2,
  HStack,
  Input,
  PasswordInput,
  VStack,
} from "@repo/ui-mobile";

import {
  authApi,
} from "../../api/api";
import {
  auth,
} from "../../api/auth";
export function LoginForm() {
  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Validation",
        "Email and Password are required."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({
        email,
        password,
      });

      console.log(
        JSON.stringify(res, null, 2)
      );

      await auth.saveToken(res.token);

      await auth.saveUser(res.user);

      Alert.alert(
        "Success",
        "Login Successful!"
      );

      // router.replace("/dashboard");

    } catch (err: any) {
      console.log(err);

      Alert.alert(
        "Login Failed",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   <Card>
  <VStack spacing={24}>
    <VStack
      align="center"
      spacing={8}
    >
      <H2>Welcome Back</H2>

      <Body
        style={{
          textAlign: "center",
        }}
      >
        Sign in to access your training dashboard.
      </Body>
    </VStack>

    <Input
      label="Email Address"
      placeholder="john.doe@email.com"
      keyboardType="email-address"
      autoCapitalize="none"
      value={email}
      onChangeText={setEmail}
    />

    <PasswordInput
      label="Password"
      placeholder="••••••••"
      value={password}
      onChangeText={setPassword}
    />

    <HStack
      justify="space-between"
      align="center"
    >
      <HStack
        align="center"
        spacing={8}
      >
        <Switch
          value={remember}
          onValueChange={setRemember}
        />

        <Body>
          Remember this device
        </Body>
      </HStack>

      <Pressable>
        <Body
          style={{
            color: "#001736",
            fontWeight: "600",
          }}
        >
          Forgot Password?
        </Body>
      </Pressable>
    </HStack>

    <Button
      loading={loading}
      onPress={handleLogin}
    >
      Sign In
    </Button>

    <Divider />

    <Button variant="outline">
      Biometric Login
    </Button>
  </VStack>
</Card>
  );
}