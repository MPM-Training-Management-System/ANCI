import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginScreen() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
      />

      <SafeAreaView style={styles.container}>
        <LoginForm />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
});