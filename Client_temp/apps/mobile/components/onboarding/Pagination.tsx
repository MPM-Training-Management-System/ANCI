import { StyleSheet, View } from "react-native";

type Props = {
  currentIndex: number;
  length: number;
};

export default function Pagination({
  currentIndex,
  length,
}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 25,
    justifyContent: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#D1D5DB",
  },

  active: {
    width: 24,
    backgroundColor: "#2563EB",
  },
});