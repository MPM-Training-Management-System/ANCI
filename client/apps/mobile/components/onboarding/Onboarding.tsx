import { useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import OnboardingSlide from "./OnboardingSlide";
import Pagination from "./Pagination";
import { onboardingData } from "./data";

export default function Onboarding() {
  const router = useRouter();

  const { width } = useWindowDimensions();

  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width
    );

    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const skip = () => {
    flatListRef.current?.scrollToIndex({
      index: onboardingData.length - 1,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex !== onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skip} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <OnboardingSlide item={item} />
          </View>
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <Pagination
        currentIndex={currentIndex}
        length={onboardingData.length}
      />

      {currentIndex !== onboardingData.length - 1 ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={nextSlide}
        >
          <Text style={styles.primaryText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace("/(auth)/register")
            }
          >
            <Text style={styles.primaryText}>
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.replace("/(auth)/login")
            }
          >
            <Text style={styles.secondaryText}>
              Login
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  skip: {
    alignSelf: "flex-end",
    marginTop: 20,
    marginRight: 24,
  },

  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  primaryButton: {
    marginHorizontal: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  secondaryButton: {
    marginHorizontal: 24,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  secondaryText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
  },
});