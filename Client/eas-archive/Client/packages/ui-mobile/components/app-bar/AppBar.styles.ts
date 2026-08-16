import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    
    width: "100%",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 32,
    height: 30,
    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  content: {
    alignItems: "center",
    marginTop: 20,
  },

  image: {
    width: 64,
    height: 64,

    borderRadius: 16,

    marginBottom: 12,
  },

  title: {
     textAlign: "center",
  color: "#2563EB",
  fontSize: 20,
  fontWeight: "700",
  letterSpacing: -0.5,
    
  },

  subtitle: {
    textAlign: "center",

    marginTop: 6,
  },
});