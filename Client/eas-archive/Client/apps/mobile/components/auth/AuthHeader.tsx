import { Image, StyleSheet, View } from "react-native";

type Props = {
  image: any;
};

export default function AuthHeader({ image }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={image}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 310,
    backgroundColor: "#2563EB",

    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,

    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 270,
    height: 270,
  },
});