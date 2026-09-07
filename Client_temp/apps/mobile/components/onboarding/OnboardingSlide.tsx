import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  item: {
    title: string;
    description: string;
    image: any;
  };
};

export default function OnboardingSlide({ item }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={item.image}
        resizeMode="contain"
        style={styles.image}
      />

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.description}>
        {item.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  image: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0A1E42",
    textAlign: "center",
  },

  description: {
    marginTop: 18,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
    fontSize: 16,
    maxWidth: 320,
  },
});