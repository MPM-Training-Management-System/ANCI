import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 20,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,

    elevation: 2,

    marginBottom: 16,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 5,

    fontSize: 13,
    lineHeight: 19,

    color: "#64748B",
  },

  content: {
    gap: 16,
  },
});