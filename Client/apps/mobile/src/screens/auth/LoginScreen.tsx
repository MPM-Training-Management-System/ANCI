import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { authApi } from "../../lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Email and Password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({
        email,
        password,
      });

      console.log(res);

      Alert.alert("Success", "Login Successful!");

      // TODO:
      // Save Token
      // Navigate to Dashboard

    } catch (err: any) {
         console.log(err);
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Logo */}
        <Image
           source={require("../../assets/ancilogo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>
          Login to continue
        </Text>

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

      </View>

      <Text style={styles.footer}>
        ACE NextGen ISTMS
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 24,
  },

  content: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },

  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  footer: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 30,
    fontSize: 13,
  },
});