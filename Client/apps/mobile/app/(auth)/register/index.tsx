import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterScreen() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
      />

      <SafeAreaView style={styles.container}>
        <RegisterForm />
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