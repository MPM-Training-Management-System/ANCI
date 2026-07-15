import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";


export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/ancilogo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>ANCI</Text>

      <Text style={styles.subtitle}>
        Integrated Training Management System
      </Text>

      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },

  loader: {
    marginTop: 40,
  },
});