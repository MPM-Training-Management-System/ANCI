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
     width: "100%",
  marginTop: -90,
  marginBottom: -30,
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
});