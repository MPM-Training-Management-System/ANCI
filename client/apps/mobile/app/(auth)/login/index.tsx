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
     width: "100%",
  marginTop: -90,
  marginBottom: -30,
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
});