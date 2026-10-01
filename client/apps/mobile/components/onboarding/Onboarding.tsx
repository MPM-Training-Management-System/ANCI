import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
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

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import * as SecureStore from "expo-secure-store";

import OnboardingSlide from "./OnboardingSlide";
import Pagination from "./Pagination";
import { onboardingData } from "./data";

import { authApi } from "@/api/api";

import { useGoogleAuth } from "@repo/hooks";

// =========================================================
// GOOGLE CLIENT ID
// =========================================================

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

const GOOGLE_REGISTRATION_TOKEN_KEY =
  "google_registration_id_token";

// =========================================================
// COMPONENT
// =========================================================

export default function Onboarding() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const { slide } =
    useLocalSearchParams<{
      slide?: string;
    }>();

  // =======================================================
  // INITIAL SLIDE
  // =======================================================

  const initialIndex =
    slide === "3"
      ? 2
      : 0;

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(initialIndex);

  const [
    isGoogleLoading,
    setIsGoogleLoading,
  ] = useState(false);

  const flatListRef =
    useRef<FlatList>(null);

  // =======================================================
  // GOOGLE AUTH HOOK
  // =======================================================

  const {
    googleLogin,
  } = useGoogleAuth(authApi);

  // =======================================================
  // CONFIGURE GOOGLE SIGN-IN
  // =======================================================

  useEffect(() => {
    console.log(
      "========================================"
    );

    console.log(
      "CONFIGURING NATIVE GOOGLE SIGN-IN"
    );

    console.log(
      "GOOGLE WEB CLIENT ID:",
      GOOGLE_WEB_CLIENT_ID
    );

    console.log(
      "========================================"
    );

    if (!GOOGLE_WEB_CLIENT_ID) {
      console.error(
        "GOOGLE WEB CLIENT ID IS MISSING"
      );

      return;
    }

    GoogleSignin.configure({
      webClientId:
        GOOGLE_WEB_CLIENT_ID,

      offlineAccess: false,
    });
  }, []);

  // =======================================================
  // GOOGLE LOGIN
  // =======================================================

  const handleGoogleSignIn =
    async () => {
      try {
        // =================================================
        // CHECK CLIENT ID
        // =================================================

        if (!GOOGLE_WEB_CLIENT_ID) {
          console.error(
            "GOOGLE WEB CLIENT ID IS MISSING"
          );

          Alert.alert(
            "Google Sign-In",
            "Google Web Client ID is missing. Please check your .env file."
          );

          return;
        }

        // =================================================
        // START LOADING
        // =================================================

        setIsGoogleLoading(true);

        // =================================================
        // DEBUG
        // =================================================

        console.log(
          "========================================"
        );

        console.log(
          "GOOGLE NATIVE SIGN-IN START"
        );

        console.log(
          "GOOGLE WEB CLIENT ID:",
          GOOGLE_WEB_CLIENT_ID
        );

        console.log(
          "========================================"
        );

        // =================================================
        // CHECK GOOGLE PLAY SERVICES
        // =================================================

        console.log(
          "Checking Google Play Services..."
        );

        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog:
            true,
        });

        console.log(
          "Google Play Services available."
        );

        // =================================================
        // OPEN NATIVE GOOGLE SIGN-IN
        // =================================================

        console.log(
          "Opening native Google Sign-In..."
        );

        const response =
          await GoogleSignin.signIn();

        // =================================================
        // DEBUG RESPONSE
        // =================================================

        console.log(
          "========================================"
        );

        console.log(
          "GOOGLE SIGN-IN RESPONSE RECEIVED"
        );

        console.log(
          "========================================"
        );

        console.log(
          "GOOGLE USER:",
          response.data?.user
        );

        console.log(
          "HAS ID TOKEN:",
          Boolean(
            response.data?.idToken
          )
        );

        // =================================================
        // GET ID TOKEN
        // =================================================

        const idToken =
          response.data?.idToken;

        if (!idToken) {
          console.error(
            "GOOGLE DID NOT RETURN AN ID TOKEN"
          );

          Alert.alert(
            "Google Sign-In Failed",
            "Google did not return an ID token. Please check your Google OAuth configuration."
          );

          return;
        }

        // =================================================
        // TOKEN RECEIVED
        // =================================================

        console.log(
          "========================================"
        );

        console.log(
          "GOOGLE ID TOKEN RECEIVED"
        );

        console.log(
          "ID TOKEN AVAILABLE:",
          true
        );

        console.log(
          "========================================"
        );

        // =================================================
        // SEND ID TOKEN TO BACKEND
        // =================================================

        console.log(
          "Sending Google ID token to backend..."
        );

        /*
         * IMPORTANT:
         *
         * Do NOT print the actual ID token.
         */

        const loginResult =
          await googleLogin({
            idToken,
          });

        console.log(
          "GOOGLE LOGIN RESULT:",
          loginResult
        );

        // =================================================
        // NULL RESPONSE
        // =================================================

        if (!loginResult) {
          console.error(
            "GOOGLE LOGIN RETURNED NULL"
          );

          Alert.alert(
            "Google Login Failed",
            "The server did not return a valid login response. Please try again."
          );

          return;
        }

        // =================================================
        // NEW GOOGLE USER
        // =================================================

        if (
          loginResult.requiresRegistration ||
          loginResult.isNewUser
        ) {
          console.log(
            "NEW GOOGLE USER - REGISTRATION REQUIRED"
          );

          try {
            // =============================================
            // SAVE GOOGLE ID TOKEN SECURELY
            // =============================================

            await SecureStore.setItemAsync(
              GOOGLE_REGISTRATION_TOKEN_KEY,
              idToken
            );

            console.log(
              "Google registration token saved securely."
            );

            // =============================================
            // BUILD REGISTRATION PARAMS
            // =============================================

            const params =
              new URLSearchParams();

            params.set(
              "google",
              "1"
            );

            if (
              loginResult.email
            ) {
              params.set(
                "email",
                loginResult.email
              );
            }

            if (
              loginResult.firstName
            ) {
              params.set(
                "firstName",
                loginResult.firstName
              );
            }

            if (
              loginResult.lastName
            ) {
              params.set(
                "lastName",
                loginResult.lastName
              );
            }

            if (
              loginResult.fullName
            ) {
              params.set(
                "fullName",
                loginResult.fullName
              );
            }

            if (
              loginResult.profileImageUrl
            ) {
              params.set(
                "profileImageUrl",
                loginResult.profileImageUrl
              );
            }

            console.log(
              "Redirecting new Google user to registration..."
            );

            // =============================================
            // GO TO REGISTER
            // =============================================

            router.replace(
              `/(auth)/register?${params.toString()}`
            );

            return;
          } catch (registrationError) {
            console.error(
              "GOOGLE REGISTRATION PREPARATION ERROR:",
              registrationError
            );

            Alert.alert(
              "Registration Error",
              "We could not prepare your Google registration. Please try again."
            );

            return;
          }
        }

        // =================================================
        // EXISTING GOOGLE USER
        // =================================================

        console.log(
          "EXISTING GOOGLE USER"
        );

        // =================================================
        // CHECK LOGIN RESPONSE
        // =================================================

        if (!loginResult.login) {
          console.error(
            "GOOGLE LOGIN OBJECT IS MISSING"
          );

          Alert.alert(
            "Google Login Failed",
            "We could not complete your login. Please try again."
          );

          return;
        }

        // =================================================
        // CHECK TOKEN
        // =================================================

        if (
          !loginResult.login.token
        ) {
          console.error(
            "AUTH TOKEN IS MISSING"
          );

          Alert.alert(
            "Google Login Failed",
            "No authentication token was returned by the server."
          );

          return;
        }

        // =================================================
        // CHECK USER
        // =================================================

        if (
          !loginResult.login.user
        ) {
          console.error(
            "USER OBJECT IS MISSING"
          );

          Alert.alert(
            "Google Login Failed",
            "No user information was returned by the server."
          );

          return;
        }

        console.log(
          "EXISTING GOOGLE USER LOGIN SUCCESSFUL"
        );

        console.log(
          "USER:",
          loginResult.login.user
        );

        // =================================================
        // EXISTING USER → DASHBOARD
        // =================================================

        Alert.alert(
          "Welcome to ANCI",
          `Welcome ${
            loginResult.login.user
              .fullName ??
            loginResult.login.user
              .fullName ??
            response.data?.user
              ?.name ??
            "User"
          }!`,
          [
            {
              text: "Continue",

              onPress: () => {
                router.replace(
                  "/(tabs)"
                );
              },
            },
          ]
        );
      } catch (error: any) {
        // =================================================
        // GOOGLE SIGN-IN ERROR
        // =================================================

        console.error(
          "========================================"
        );

        console.error(
          "GOOGLE SIGN-IN ERROR"
        );

        console.error(
          error
        );

        console.error(
          "========================================"
        );

        // =================================================
        // USER CANCELLED
        // =================================================

        if (
          error?.code ===
          statusCodes.SIGN_IN_CANCELLED
        ) {
          console.log(
            "Google Sign-In cancelled by user."
          );

          return;
        }

        // =================================================
        // SIGN-IN ALREADY IN PROGRESS
        // =================================================

        if (
          error?.code ===
          statusCodes.IN_PROGRESS
        ) {
          console.log(
            "Google Sign-In is already in progress."
          );

          return;
        }

        // =================================================
        // PLAY SERVICES UNAVAILABLE
        // =================================================

        if (
          error?.code ===
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          Alert.alert(
            "Google Play Services",
            "Google Play Services is not available or needs to be updated on this device."
          );

          return;
        }

        // =================================================
        // OTHER ERROR
        // =================================================

        Alert.alert(
          "Google Sign-In Failed",
          error instanceof Error
            ? error.message
            : "Unable to continue with Google. Please try again."
        );
      } finally {
        setIsGoogleLoading(false);
      }
    };

  // =========================================================
  // HANDLE SLIDE
  // =========================================================

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index =
      Math.round(
        event.nativeEvent.contentOffset.x /
          width
      );

    setCurrentIndex(index);
  };

  // =========================================================
  // NEXT SLIDE
  // =========================================================

  const nextSlide = () => {
    if (
      currentIndex <
      onboardingData.length - 1
    ) {
      const nextIndex =
        currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(
        nextIndex
      );
    }
  };

  // =========================================================
  // SKIP
  // =========================================================

  const skip = () => {
    const lastIndex =
      onboardingData.length - 1;

    flatListRef.current?.scrollToIndex({
      index: lastIndex,
      animated: true,
    });

    setCurrentIndex(
      lastIndex
    );
  };

  // =========================================================
  // LAST SLIDE
  // =========================================================

  const isLastSlide =
    currentIndex ===
    onboardingData.length - 1;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* ================================================== */}
      {/* SKIP */}
      {/* ================================================== */}

      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skip}
          onPress={skip}
        >
          <Text
            style={styles.skipText}
          >
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* ================================================== */}
      {/* ONBOARDING SLIDES */}
      {/* ================================================== */}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        keyExtractor={(item) =>
          item.id
        }
        initialScrollIndex={
          initialIndex
        }
        renderItem={({
          item,
        }) => (
          <View
            style={{
              width,

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >
            <OnboardingSlide
              item={item}
            />
          </View>
        )}
        onMomentumScrollEnd={
          onMomentumScrollEnd
        }
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        getItemLayout={(
          _,
          index
        ) => ({
          length: width,

          offset:
            width * index,

          index,
        })}
      />

      {/* ================================================== */}
      {/* PAGINATION */}
      {/* ================================================== */}

      <Pagination
        currentIndex={
          currentIndex
        }
        length={
          onboardingData.length
        }
      />

      {/* ================================================== */}
      {/* BUTTONS */}
      {/* ================================================== */}

      {!isLastSlide ? (
        <TouchableOpacity
          style={
            styles.primaryButton
          }
          onPress={
            nextSlide
          }
        >
          <Text
            style={
              styles.primaryText
            }
          >
            Next
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={
            styles.authActions
          }
        >
          {/* ============================================== */}
          {/* CREATE ACCOUNT */}
          {/* ============================================== */}

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.replace(
                "/(auth)/register"
              )
            }
            disabled={
              isGoogleLoading
            }
          >
            <Text
              style={
                styles.primaryText
              }
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* ============================================== */}
          {/* GOOGLE */}
          {/* ============================================== */}

          <TouchableOpacity
            style={[
              styles.googleButton,

              isGoogleLoading &&
                styles.googleButtonDisabled,
            ]}
            onPress={
              handleGoogleSignIn
            }
            disabled={
              isGoogleLoading
            }
            activeOpacity={0.8}
          >
            <View
              style={
                styles.googleIconContainer
              }
            >
              <Text
                style={
                  styles.googleIcon
                }
              >
                G
              </Text>
            </View>

            <Text
              style={
                styles.googleButtonText
              }
            >
              {isGoogleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          {/* ============================================== */}
          {/* LOGIN */}
          {/* ============================================== */}

          <TouchableOpacity
            style={
              styles.secondaryButton
            }
            onPress={() =>
              router.replace(
                "/(auth)/login"
              )
            }
            disabled={
              isGoogleLoading
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    skip: {
      alignSelf:
        "flex-end",
      marginTop: 20,
      marginRight: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },

    skipText: {
      fontSize: 16,
      fontWeight:
        "600",
      color:
        "#2563EB",
    },

    authActions: {
      width: "100%",
      paddingHorizontal: 24,
      paddingBottom: 30,
    },

    primaryButton: {
      marginHorizontal: 24,
      height: 56,
      borderRadius: 28,
      backgroundColor:
        "#2563EB",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 14,

      shadowColor:
        "#2563EB",
      shadowOpacity:
        0.18,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 4,
    },

    primaryText: {
      color:
        "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "800",
    },

    googleButton: {
      height: 54,
      marginHorizontal: 24,
      marginBottom: 14,
      borderRadius: 27,
      borderWidth: 1,
      borderColor:
        "#D9E2EC",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      position:
        "relative",

      shadowColor:
        "#000",
      shadowOpacity:
        0.04,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    googleButtonDisabled: {
      opacity: 0.6,
    },

    googleIconContainer: {
      position:
        "absolute",
      left: 18,
      width: 28,
      height: 28,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    googleIcon: {
      fontSize: 19,
      fontWeight:
        "900",
      color:
        "#4285F4",
    },

    googleButtonText: {
      fontSize: 15,
      fontWeight:
        "700",
      color:
        "#334155",
    },

    secondaryButton: {
      marginHorizontal: 24,
      height: 56,
      borderRadius: 28,
      borderWidth: 1.5,
      borderColor:
        "#BFDBFE",
      backgroundColor:
        "#F8FBFF",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 0,
    },

    secondaryText: {
      color:
        "#2563EB",
      fontSize: 17,
      fontWeight:
        "800",
    },
  });