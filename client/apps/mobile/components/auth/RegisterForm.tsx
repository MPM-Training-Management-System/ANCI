"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  useRegister,
  type RegisterFormValues,
} from "@/hooks/UseRegister";

import { authApi } from "@/api/api";

type Step = 1 | 2 | 3 | 4;

type ProfileImage = {
  uri: string;
  name: string;
  type: string;
};

type LocationItem = {
  code: string;
  name: string;
};

type InputProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: React.ComponentProps<
    typeof TextInput
  >["keyboardType"];
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  autoCapitalize?: React.ComponentProps<
    typeof TextInput
  >["autoCapitalize"];
  editable?: boolean;
};

type DropdownButtonProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value?: string;
  placeholder: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const PSGC_API = "https://psgc.gitlab.io/api";

const GOOGLE_REGISTRATION_TOKEN_KEY =
  "google_registration_id_token";

const genderOptions = [
  "Male",
  "Female",
  "Prefer not to say",
];

// ======================================================
// REUSABLE INPUT
// ======================================================

function Input({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  rightElement,
  autoCapitalize = "sentences",
  editable = true,
}: InputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          value.length > 0 &&
            styles.inputWrapperActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
          style={styles.inputIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          style={styles.input}
        />

        {rightElement}
      </View>
    </View>
  );
}

// ======================================================
// DROPDOWN BUTTON
// ======================================================

function DropdownButton({
  label,
  icon,
  value,
  placeholder,
  onPress,
  loading = false,
  disabled = false,
}: DropdownButtonProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.inputWrapper,
          value &&
            styles.inputWrapperActive,
          pressed &&
            !disabled &&
            styles.dropdownPressed,
          disabled &&
            styles.dropdownDisabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
          style={styles.inputIcon}
        />

        <Text
          style={[
            styles.dropdownText,
            !value &&
              styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {loading
            ? "Loading..."
            : value || placeholder}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        ) : (
          <Ionicons
            name="chevron-down"
            size={19}
            color="#64748B"
          />
        )}
      </Pressable>
    </View>
  );
}

// ======================================================
// REGISTER FORM
// ======================================================

export default function RegisterForm() {
  const router = useRouter();

  // ====================================================
  // GOOGLE REGISTRATION
  // ====================================================

  const params = useLocalSearchParams<{
    google?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profileImageUrl?: string;
  }>();

  const isGoogleRegistration =
    params.google === "1";

  const googleEmail =
    typeof params.email === "string"
      ? params.email
      : "";

  const googleFirstName =
    typeof params.firstName === "string"
      ? params.firstName
      : "";

  const googleLastName =
    typeof params.lastName === "string"
      ? params.lastName
      : "";

  const googleProfileImageUrl =
    typeof params.profileImageUrl ===
    "string"
      ? params.profileImageUrl
      : "";

  const {
    register,
    isLoading,
    error,
  } = useRegister(authApi);

  // ====================================================
  // STEP
  // ====================================================

  const [step, setStep] =
    useState<Step>(1);

  // ====================================================
  // ACCOUNT INFORMATION
  // STEP 1
  // ====================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // ====================================================
  // PERSONAL INFORMATION
  // STEP 2
  // ====================================================

  const [firstName, setFirstName] =
    useState("");

  const [middleName, setMiddleName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [gender, setGender] =
    useState("");

  // ====================================================
  // ADDRESS INFORMATION
  // STEP 3
  // ====================================================

  const [houseNumber, setHouseNumber] =
    useState("");

  const [province, setProvince] =
    useState<LocationItem | null>(null);

  const [municipality, setMunicipality] =
    useState<LocationItem | null>(null);

  const [barangay, setBarangay] =
    useState<LocationItem | null>(null);

  // ====================================================
  // CONTACT INFORMATION
  // ====================================================

  const [mobileNumber, setMobileNumber] =
    useState("");

  // ====================================================
  // PROFILE IMAGE
  // STEP 4
  // ====================================================

  const [profileImage, setProfileImage] =
    useState<ProfileImage | null>(null);

  // ====================================================
  // GOOGLE ID TOKEN
  // ====================================================

  const [googleIdToken, setGoogleIdToken] =
    useState<string | null>(null);

  // ====================================================
  // LOCATION DATA
  // ====================================================

  const [provinces, setProvinces] =
    useState<LocationItem[]>([]);

  const [municipalities, setMunicipalities] =
    useState<LocationItem[]>([]);

  const [barangays, setBarangays] =
    useState<LocationItem[]>([]);

  const [
    isLoadingProvinces,
    setIsLoadingProvinces,
  ] = useState(false);

  const [
    isLoadingMunicipalities,
    setIsLoadingMunicipalities,
  ] = useState(false);

  const [
    isLoadingBarangays,
    setIsLoadingBarangays,
  ] = useState(false);

  // ====================================================
  // DROPDOWNS / MODALS
  // ====================================================

  const [activeDropdown, setActiveDropdown] =
    useState<
      | "province"
      | "municipality"
      | "barangay"
      | null
    >(null);

  const [
    showGenderDropdown,
    setShowGenderDropdown,
  ] = useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [localError, setLocalError] =
    useState("");

  // ==================================================
  // GOOGLE REGISTRATION INITIALIZATION
  // ==================================================

  useEffect(() => {
    if (!isGoogleRegistration) {
      return;
    }

    setFirstName(
      googleFirstName.trim()
    );

    setLastName(
      googleLastName.trim()
    );

    setEmail(
      googleEmail.trim().toLowerCase()
    );

    if (googleProfileImageUrl) {
      setProfileImage({
        uri: googleProfileImageUrl,
        name: "google-profile.jpg",
        type: "image/jpeg",
      });
    }

    const loadGoogleToken =
      async () => {
        try {
          const token =
            await SecureStore.getItemAsync(
              GOOGLE_REGISTRATION_TOKEN_KEY
            );

          if (!token) {
            console.warn(
              "GOOGLE REGISTRATION: ID token not found."
            );

            setLocalError(
              "Your Google registration session has expired. Please continue with Google again."
            );

            return;
          }

          setGoogleIdToken(token);

          console.log(
            "GOOGLE REGISTRATION: ID token found."
          );
        } catch (error) {
          console.error(
            "GOOGLE TOKEN LOAD ERROR:",
            error
          );

          setLocalError(
            "Unable to restore your Google registration session."
          );
        }
      };

    loadGoogleToken();
  }, [
    isGoogleRegistration,
    googleEmail,
    googleFirstName,
    googleLastName,
    googleProfileImageUrl,
  ]);

  // ==================================================
  // LOAD PROVINCES
  // ==================================================

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true);

        const response = await fetch(
          `${PSGC_API}/provinces/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load provinces."
          );
        }

        const data =
          await response.json();

        const formatted: LocationItem[] =
          data
            .map(
              (item: {
                code: string;
                name: string;
              }) => ({
                code: item.code,
                name: item.name,
              })
            )
            .sort(
              (
                a: LocationItem,
                b: LocationItem
              ) =>
                a.name.localeCompare(
                  b.name
                )
            );

        setProvinces(formatted);
      } catch (error) {
        console.error(
          "LOAD PROVINCES ERROR:",
          error
        );

        setLocalError(
          "Unable to load provinces. Please try again."
        );
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // ==================================================
  // LOAD MUNICIPALITIES
  // ==================================================

  const handleProvinceSelect =
    async (
      item: LocationItem
    ) => {
      setProvince(item);

      setMunicipality(null);
      setBarangay(null);

      setMunicipalities([]);
      setBarangays([]);

      setActiveDropdown(null);

      try {
        setIsLoadingMunicipalities(
          true
        );

        const response = await fetch(
          `${PSGC_API}/provinces/${item.code}/municipalities/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load municipalities."
          );
        }

        const data =
          await response.json();

        const formatted: LocationItem[] =
          data
            .map(
              (location: {
                code: string;
                name: string;
              }) => ({
                code: location.code,
                name: location.name,
              })
            )
            .sort(
              (
                a: LocationItem,
                b: LocationItem
              ) =>
                a.name.localeCompare(
                  b.name
                )
            );

        setMunicipalities(
          formatted
        );
      } catch (error) {
        console.error(
          "LOAD MUNICIPALITIES ERROR:",
          error
        );

        setLocalError(
          "Unable to load municipalities."
        );
      } finally {
        setIsLoadingMunicipalities(
          false
        );
      }
    };

  // ==================================================
  // LOAD BARANGAYS
  // ==================================================

  const handleMunicipalitySelect =
    async (
      item: LocationItem
    ) => {
      setMunicipality(item);

      setBarangay(null);
      setBarangays([]);

      setActiveDropdown(null);

      try {
        setIsLoadingBarangays(true);

        const response = await fetch(
          `${PSGC_API}/municipalities/${item.code}/barangays/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load barangays."
          );
        }

        const data =
          await response.json();

        const formatted: LocationItem[] =
          data
            .map(
              (location: {
                code: string;
                name: string;
              }) => ({
                code: location.code,
                name: location.name,
              })
            )
            .sort(
              (
                a: LocationItem,
                b: LocationItem
              ) =>
                a.name.localeCompare(
                  b.name
                )
            );

        setBarangays(formatted);
      } catch (error) {
        console.error(
          "LOAD BARANGAYS ERROR:",
          error
        );

        setLocalError(
          "Unable to load barangays."
        );
      } finally {
        setIsLoadingBarangays(false);
      }
    };

  const handleBarangaySelect = (
    item: LocationItem
  ) => {
    setBarangay(item);
    setActiveDropdown(null);
  };

  // ==================================================
  // ADDRESS
  // ==================================================

  const formattedAddress =
    useMemo(() => {
      const parts = [
        houseNumber.trim(),
        barangay?.name,
        municipality?.name,
        province?.name,
      ].filter(Boolean);

      return parts.join(", ");
    }, [
      houseNumber,
      barangay,
      municipality,
      province,
    ]);

  // ==================================================
  // PROFILE IMAGE
  // ==================================================

  const handlePickProfileImage =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow photo library access to select a profile picture."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            }
          );

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const asset =
          result.assets[0];

        const fileName =
          asset.fileName ??
          `profile-${Date.now()}.jpg`;

        const mimeType =
          asset.mimeType ??
          "image/jpeg";

        setProfileImage({
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        });
      } catch (error) {
        console.error(
          "PROFILE IMAGE ERROR:",
          error
        );

        Alert.alert(
          "Image Error",
          "Unable to select your profile picture."
        );
      }
    };

  // ==================================================
  // DATE
  // ==================================================

  const handleBirthDateChange = (
    _event: unknown,
    selectedDate?: Date
  ) => {
    if (!selectedDate) {
      return;
    }

    const year =
      selectedDate.getFullYear();

    const month = String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      selectedDate.getDate()
    ).padStart(2, "0");

    setBirthDate(
      `${year}-${month}-${day}`
    );

    setShowDatePicker(false);
  };

  const parsedBirthDate =
    useMemo(() => {
      if (!birthDate) {
        return new Date(
          new Date().getFullYear() - 18,
          0,
          1
        );
      }

      const date = new Date(
        `${birthDate}T00:00:00`
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return new Date(
          new Date().getFullYear() - 18,
          0,
          1
        );
      }

      return date;
    }, [birthDate]);

  const formattedBirthDate =
    useMemo(() => {
      if (!birthDate) {
        return "";
      }

      const date = new Date(
        `${birthDate}T00:00:00`
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return birthDate;
      }

      return date.toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      );
    }, [birthDate]);

  // ==================================================
  // VALIDATION - STEP 1
  // ACCOUNT
  // ==================================================

  const validateStepOne = () => {
    setLocalError("");

    if (!email.trim()) {
      setLocalError(
        "Please enter your email address."
      );

      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        email.trim()
      )
    ) {
      setLocalError(
        "Please enter a valid email address."
      );

      return false;
    }

    if (!password) {
      setLocalError(
        "Please enter a password."
      );

      return false;
    }

    if (password.length < 8) {
      setLocalError(
        "Password must be at least 8 characters."
      );

      return false;
    }

    if (!confirmPassword) {
      setLocalError(
        "Please confirm your password."
      );

      return false;
    }

    if (
      password !==
      confirmPassword
    ) {
      setLocalError(
        "Passwords do not match."
      );

      return false;
    }

    if (
      isGoogleRegistration &&
      !googleIdToken
    ) {
      setLocalError(
        "Your Google registration session has expired. Please continue with Google again."
      );

      return false;
    }

    return true;
  };

  // ==================================================
  // VALIDATION - STEP 2
  // PERSONAL INFORMATION
  // ==================================================

  const validateStepTwo = () => {
    setLocalError("");

    if (!firstName.trim()) {
      setLocalError(
        "Please enter your first name."
      );

      return false;
    }

    if (!lastName.trim()) {
      setLocalError(
        "Please enter your last name."
      );

      return false;
    }

    if (!birthDate) {
      setLocalError(
        "Please select your birth date."
      );

      return false;
    }

    if (!gender) {
      setLocalError(
        "Please select your gender."
      );

      return false;
    }

    return true;
  };

  // ==================================================
  // VALIDATION - STEP 3
  // ADDRESS
  // ==================================================

  const validateStepThree = () => {
    setLocalError("");

    if (!houseNumber.trim()) {
      setLocalError(
        "Please enter your house number or street."
      );

      return false;
    }

    if (!province) {
      setLocalError(
        "Please select your province."
      );

      return false;
    }

    if (!municipality) {
      setLocalError(
        "Please select your municipality or city."
      );

      return false;
    }

    if (!barangay) {
      setLocalError(
        "Please select your barangay."
      );

      return false;
    }

    if (!mobileNumber.trim()) {
      setLocalError(
        "Please enter your mobile number."
      );

      return false;
    }

    return true;
  };

  // ==================================================
  // VALIDATION - STEP 4
  // PROFILE
  // ==================================================

  const validateStepFour = () => {
    setLocalError("");

    // Profile picture is optional.
    // If you want it required, uncomment this.

    /*
    if (!profileImage) {
      setLocalError(
        "Please select a profile picture."
      );

      return false;
    }
    */

    return true;
  };

  // ==================================================
  // NEXT
  // ==================================================

  const handleNext = () => {
    if (step === 1) {
      if (!validateStepOne()) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStepTwo()) {
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!validateStepThree()) {
        return;
      }

      setStep(4);
      return;
    }
  };

  // ==================================================
  // BACK
  // ==================================================

  const handleBack = () => {
    setLocalError("");

    if (step === 1) {
      router.replace({
        pathname: "/",
        params: {
          slide: "3",
        },
      });

      return;
    }

    setStep((current) => {
      if (current === 4) {
        return 3;
      }

      if (current === 3) {
        return 2;
      }

      return 1;
    });
  };
// ==================================================
// REGISTER
// ==================================================

const handleRegister = async () => {
  if (!validateStepFour()) {
    return;
  }

  try {
    const normalizedEmail =
      email.trim().toLowerCase();

    const values: RegisterFormValues = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      address: formattedAddress,
      birthDate,
      gender,
      email: normalizedEmail,
      mobileNumber: mobileNumber.trim(),
      password,
      profileImage: profileImage ?? undefined,
      googleIdToken: isGoogleRegistration
        ? googleIdToken ?? undefined
        : undefined,
    };

    console.log(
      "========================================"
    );

    console.log(
      "PARTICIPANT REGISTRATION"
    );

    console.log(
      "Google Registration:",
      isGoogleRegistration
    );

    console.log(
      "Google ID Token:",
      googleIdToken
        ? `FOUND (${googleIdToken.length} chars)`
        : "NOT USED"
    );

    console.log(
      "Email:",
      values.email
    );

    console.log(
      "First Name:",
      values.firstName
    );

    console.log(
      "Last Name:",
      values.lastName
    );

    console.log(
      "Address:",
      values.address
    );

    console.log(
      "Profile Image:",
      values.profileImage
        ? values.profileImage.uri
        : "NONE"
    );

    console.log(
      "========================================"
    );

    // =================================================
    // CREATE ACCOUNT
    // =================================================

    const response =
      await register(values);

    if (!response) {
      return;
    }

    console.log(
      "REGISTRATION SUCCESSFUL"
    );

    // =================================================
    // SEND OTP AFTER SUCCESSFUL REGISTRATION
    // =================================================

    console.log(
      "SENDING OTP TO:",
      normalizedEmail
    );

    const otpResponse =
      await authApi.sendOtp({
        email: normalizedEmail,
      });

    console.log(
      "SEND OTP RESPONSE:",
      otpResponse
    );

    if (!otpResponse) {
      Alert.alert(
        "Registration Successful",
        "Your account was created successfully, but we could not send the verification code. Please try sending the code again."
      );

      return;
    }

    console.log(
      "OTP SENT SUCCESSFULLY"
    );

    // =================================================
    // GOOGLE TOKEN CLEANUP
    // =================================================

    if (isGoogleRegistration) {
      try {
        await SecureStore.deleteItemAsync(
          GOOGLE_REGISTRATION_TOKEN_KEY
        );

        console.log(
          "GOOGLE REGISTRATION: temporary token deleted."
        );
      } catch (error) {
        console.error(
          "GOOGLE TOKEN CLEANUP ERROR:",
          error
        );
      }
    }

    // =================================================
    // GO TO OTP VERIFICATION
    // =================================================

    Alert.alert(
      "Registration Successful",
      isGoogleRegistration
        ? "Your account has been created with Google. A verification code has been sent to your email."
        : "Your account has been created. A verification code has been sent to your email.",
      [
        {
          text: "Continue",
          onPress: () =>
            router.push({
              pathname:
                "/(auth)/otp-verification",
              params: {
                email: normalizedEmail,
              },
            }),
        },
      ]
    );
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    Alert.alert(
      "Registration Failed",
      error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again."
    );
  }
};

  // ==================================================
  // LOCATION MODAL
  // ==================================================

  const locationItems =
    useMemo(() => {
      if (
        activeDropdown ===
        "province"
      ) {
        return provinces;
      }

      if (
        activeDropdown ===
        "municipality"
      ) {
        return municipalities;
      }

      if (
        activeDropdown ===
        "barangay"
      ) {
        return barangays;
      }

      return [];
    }, [
      activeDropdown,
      provinces,
      municipalities,
      barangays,
    ]);

  const locationTitle =
    activeDropdown === "province"
      ? "Select Province"
      : activeDropdown ===
          "municipality"
        ? "Select Municipality / City"
        : "Select Barangay";

  const handleLocationItemPress = (
    item: LocationItem
  ) => {
    if (
      activeDropdown ===
      "province"
    ) {
      handleProvinceSelect(item);
      return;
    }

    if (
      activeDropdown ===
      "municipality"
    ) {
      handleMunicipalitySelect(
        item
      );

      return;
    }

    if (
      activeDropdown ===
      "barangay"
    ) {
      handleBarangaySelect(item);
    }
  };

  // ==================================================
  // ERROR
  // ==================================================

  const displayError =
    localError || error;

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "bottom",
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Pressable
                onPress={handleBack}
                disabled={isLoading}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed &&
                    styles.backButtonPressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#0F172A"
                />
              </Pressable>
            </View>
          </View>

          {/* ================================= */}
          {/* TITLE */}
          {/* ================================= */}

          <View style={styles.content}>
            <Text
              style={styles.welcomeTitle}
            >
              Create your account
            </Text>

            <Text
              style={
                styles.welcomeSubtitle
              }
            >
              {
                stepDescriptions[
                  step
                ]
              }
            </Text>

            {/* ================================= */}
            {/* STEP INDICATOR */}
            {/* ================================= */}

            <View
              style={
                styles.stepIndicator
              }
            >
              {[1, 2, 3, 4].map(
                (item, index) => {
                  const isActive =
                    item === step;

                  const isCompleted =
                    item < step;

                  return (
                    <React.Fragment
                      key={item}
                    >
                      <View
                        style={[
                          styles.stepCircle,
                          isActive &&
                            styles.stepCircleActive,
                          isCompleted &&
                            styles.stepCircleCompleted,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.stepNumber,
                              isActive &&
                                styles.stepNumberActive,
                            ]}
                          >
                            {item}
                          </Text>
                        )}
                      </View>

                      {index < 3 && (
                        <View
                          style={[
                            styles.stepLine,
                            item < step &&
                              styles.stepLineActive,
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </View>

            <Text
              style={styles.stepTitle}
            >
              {stepTitles[step]}
            </Text>

            {/* ================================= */}
            {/* GOOGLE ACCOUNT NOTICE */}
            {/* ================================= */}

            {isGoogleRegistration &&
              step === 1 && (
                <View
                  style={
                    styles.googleInfoBox
                  }
                >
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#2563EB"
                  />

                  <View
                    style={
                      styles.googleInfoContent
                    }
                  >
                    <Text
                      style={
                        styles.googleInfoTitle
                      }
                    >
                      Google account detected
                    </Text>

                    <Text
                      style={
                        styles.googleInfoText
                      }
                    >
                      Your Google email,
                      name, and profile
                      picture have been
                      filled in automatically.
                      Please complete the
                      remaining information.
                    </Text>
                  </View>
                </View>
              )}

            {/* ================================= */}
            {/* STEP 1 - ACCOUNT INFORMATION */}
            {/* ================================= */}

            {step === 1 && (
              <>
                <Input
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={
                    !isLoading &&
                    !isGoogleRegistration
                  }
                />

                <Input
                  label="Password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  placeholder="Enter your password"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightElement={
                    <Pressable
                      onPress={() =>
                        setShowPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        isLoading
                      }
                      hitSlop={10}
                      style={
                        styles.eyeButton
                      }
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={21}
                        color="#718096"
                      />
                    </Pressable>
                  }
                />

                <Input
                  label="Confirm Password"
                  icon="lock-closed-outline"
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                  placeholder="Confirm your password"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightElement={
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        isLoading
                      }
                      hitSlop={10}
                      style={
                        styles.eyeButton
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={21}
                        color="#718096"
                      />
                    </Pressable>
                  }
                />

                <View
                  style={
                    styles.passwordRules
                  }
                >
                  <Text
                    style={
                      styles.passwordRulesTitle
                    }
                  >
                    Password requirements
                  </Text>

                  <View
                    style={
                      styles.ruleRow
                    }
                  >
                    <Ionicons
                      name={
                        password.length >=
                        8
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={17}
                      color={
                        password.length >=
                        8
                          ? "#16A34A"
                          : "#94A3B8"
                      }
                    />

                    <Text
                      style={
                        styles.ruleText
                      }
                    >
                      At least 8 characters
                    </Text>
                  </View>

                  <View
                    style={
                      styles.ruleRow
                    }
                  >
                    <Ionicons
                      name={
                        password &&
                        confirmPassword &&
                        password ===
                          confirmPassword
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={17}
                      color={
                        password &&
                        confirmPassword &&
                        password ===
                          confirmPassword
                          ? "#16A34A"
                          : "#94A3B8"
                      }
                    />

                    <Text
                      style={
                        styles.ruleText
                      }
                    >
                      Passwords match
                    </Text>
                  </View>
                </View>

                {isGoogleRegistration && (
                  <View
                    style={
                      styles.googleEmailNote
                    }
                  >
                    <Ionicons
                      name="logo-google"
                      size={16}
                      color="#2563EB"
                    />

                    <Text
                      style={
                        styles.googleEmailNoteText
                      }
                    >
                      This email is linked
                      to your Google
                      account.
                    </Text>
                  </View>
                )}

                <View
                  style={styles.infoBox}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#2563EB"
                  />

                  <Text
                    style={styles.infoText}
                  >
                    Your email and
                    password will be used
                    to access your
                    participant account.
                  </Text>
                </View>
              </>
            )}

            {/* ================================= */}
            {/* STEP 2 - PERSONAL INFORMATION */}
            {/* ================================= */}

            {step === 2 && (
              <>
                <View
                  style={styles.nameRow}
                >
                  <View
                    style={
                      styles.nameField
                    }
                  >
                    <Input
                      label="First Name"
                      icon="person-outline"
                      value={
                        firstName
                      }
                      onChangeText={
                        setFirstName
                      }
                      placeholder="First name"
                      autoCapitalize="words"
                      editable={
                        !isLoading &&
                        !isGoogleRegistration
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.nameField
                    }
                  >
                    <Input
                      label="Last Name"
                      icon="person-outline"
                      value={
                        lastName
                      }
                      onChangeText={
                        setLastName
                      }
                      placeholder="Last name"
                      autoCapitalize="words"
                      editable={
                        !isLoading &&
                        !isGoogleRegistration
                      }
                    />
                  </View>
                </View>

                <Input
                  label="Middle Name"
                  icon="person-outline"
                  value={middleName}
                  onChangeText={
                    setMiddleName
                  }
                  placeholder="Middle name (optional)"
                  autoCapitalize="words"
                  editable={!isLoading}
                />

                {/* GENDER */}

                <View
                  style={styles.field}
                >
                  <Text
                    style={styles.label}
                  >
                    Gender
                  </Text>

                  <Pressable
                    onPress={() =>
                      setShowGenderDropdown(
                        true
                      )
                    }
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.inputWrapper,
                      gender &&
                        styles.inputWrapperActive,
                      pressed &&
                        styles.dropdownPressed,
                    ]}
                  >
                    <Ionicons
                      name="male-female-outline"
                      size={20}
                      color="#2563EB"
                      style={
                        styles.inputIcon
                      }
                    />

                    <Text
                      style={[
                        styles.dropdownText,
                        !gender &&
                          styles.dropdownPlaceholder,
                      ]}
                    >
                      {gender ||
                        "Select gender"}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={19}
                      color="#64748B"
                    />
                  </Pressable>
                </View>

                {/* BIRTH DATE */}

                <View
                  style={styles.field}
                >
                  <Text
                    style={styles.label}
                  >
                    Birth Date
                  </Text>

                  <Pressable
                    onPress={() =>
                      setShowDatePicker(
                        true
                      )
                    }
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.inputWrapper,
                      birthDate &&
                        styles.inputWrapperActive,
                      pressed &&
                        styles.dropdownPressed,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2563EB"
                      style={
                        styles.inputIcon
                      }
                    />

                    <Text
                      style={[
                        styles.dropdownText,
                        !birthDate &&
                          styles.dropdownPlaceholder,
                      ]}
                    >
                      {formattedBirthDate ||
                        "Select birth date"}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={19}
                      color="#64748B"
                    />
                  </Pressable>
                </View>

                <View
                  style={styles.infoBox}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#2563EB"
                  />

                  <Text
                    style={styles.infoText}
                  >
                    Please make sure your
                    personal information
                    matches your valid
                    identification details.
                  </Text>
                </View>
              </>
            )}

            {/* ================================= */}
            {/* STEP 3 - ADDRESS */}
            {/* ================================= */}

            {step === 3 && (
              <>
                <Input
                  label="House Number / Street"
                  icon="home-outline"
                  value={
                    houseNumber
                  }
                  onChangeText={
                    setHouseNumber
                  }
                  placeholder="House number or street"
                  autoCapitalize="words"
                  editable={!isLoading}
                />

                <DropdownButton
                  label="Province"
                  icon="location-outline"
                  value={
                    province?.name
                  }
                  placeholder="Select province"
                  onPress={() =>
                    setActiveDropdown(
                      "province"
                    )
                  }
                  loading={
                    isLoadingProvinces
                  }
                  disabled={
                    isLoading ||
                    isLoadingProvinces
                  }
                />

                <DropdownButton
                  label="Municipality / City"
                  icon="business-outline"
                  value={
                    municipality?.name
                  }
                  placeholder={
                    province
                      ? "Select municipality / city"
                      : "Select province first"
                  }
                  onPress={() =>
                    setActiveDropdown(
                      "municipality"
                    )
                  }
                  loading={
                    isLoadingMunicipalities
                  }
                  disabled={
                    isLoading ||
                    !province ||
                    isLoadingMunicipalities
                  }
                />

                <DropdownButton
                  label="Barangay"
                  icon="map-outline"
                  value={
                    barangay?.name
                  }
                  placeholder={
                    municipality
                      ? "Select barangay"
                      : "Select municipality first"
                  }
                  onPress={() =>
                    setActiveDropdown(
                      "barangay"
                    )
                  }
                  loading={
                    isLoadingBarangays
                  }
                  disabled={
                    isLoading ||
                    !municipality ||
                    isLoadingBarangays
                  }
                />

                <Input
                  label="Mobile Number"
                  icon="phone-portrait-outline"
                  value={
                    mobileNumber
                  }
                  onChangeText={
                    setMobileNumber
                  }
                  placeholder="09XXXXXXXXX"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                {formattedAddress ? (
                  <View
                    style={
                      styles.addressPreview
                    }
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={18}
                      color="#2563EB"
                    />

                    <View
                      style={
                        styles.addressContent
                      }
                    >
                      <Text
                        style={
                          styles.addressLabel
                        }
                      >
                        Address Preview
                      </Text>

                      <Text
                        style={
                          styles.addressText
                        }
                      >
                        {
                          formattedAddress
                        }
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View
                  style={styles.infoBox}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#2563EB"
                  />

                  <Text
                    style={styles.infoText}
                  >
                    Your address will be
                    used for your
                    participant profile
                    and official training
                    records.
                  </Text>
                </View>
              </>
            )}

            {/* ================================= */}
            {/* STEP 4 - PROFILE PICTURE */}
            {/* ================================= */}

            {step === 4 && (
              <>
                <View
                  style={
                    styles.profileIntro
                  }
                >
                  <Text
                    style={
                      styles.profileIntroTitle
                    }
                  >
                    Add your profile picture
                  </Text>

                  <Text
                    style={
                      styles.profileIntroText
                    }
                  >
                    Upload a clear photo so
                    your profile can be easily
                    identified.
                  </Text>
                </View>

                <View
                  style={
                    styles.profileSection
                  }
                >
                  <Text
                    style={styles.label}
                  >
                    Profile Picture
                  </Text>

                  <Pressable
                    onPress={
                      handlePickProfileImage
                    }
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.profilePicker,
                      pressed &&
                        styles.profilePickerPressed,
                    ]}
                  >
                    {profileImage ? (
                      <>
                        <Image
                          source={{
                            uri: profileImage.uri,
                          }}
                          style={
                            styles.profileImage
                          }
                        />

                        <View
                          style={
                            styles.profileOverlay
                          }
                        >
                          <Ionicons
                            name="camera-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={
                            styles.profileIconCircle
                          }
                        >
                          <Ionicons
                            name="camera-outline"
                            size={24}
                            color="#2563EB"
                          />
                        </View>

                        <Text
                          style={
                            styles.profileTitle
                          }
                        >
                          Add profile picture
                        </Text>

                        <Text
                          style={
                            styles.profileSubtitle
                          }
                        >
                          Optional
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>

                <View
                  style={
                    styles.accountSummary
                  }
                >
                  <View
                    style={
                      styles.summaryHeader
                    }
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={19}
                      color="#16A34A"
                    />

                    <Text
                      style={
                        styles.summaryTitle
                      }
                    >
                      Registration Summary
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryRow
                    }
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Name
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {firstName}{" "}
                      {lastName}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryRow
                    }
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Email
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                      numberOfLines={1}
                    >
                      {email}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryRow
                    }
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Address
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                      numberOfLines={2}
                    >
                      {formattedAddress}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.securityBox
                  }
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.securityBoxText
                    }
                  >
                    Your account information
                    is securely protected.
                    Review your details before
                    creating your participant
                    account.
                  </Text>
                </View>
              </>
            )}

            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {displayError ? (
              <View
                style={
                  styles.errorContainer
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <Text
                  style={styles.errorText}
                >
                  {displayError}
                </Text>
              </View>
            ) : null}

            {/* ================================= */}
            {/* ACTION BUTTONS */}
            {/* ================================= */}

            <View
              style={styles.actionArea}
            >
              {step > 1 && (
                <Pressable
                  onPress={handleBack}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed &&
                      styles.secondaryButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Back
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={
                  step === 4
                    ? handleRegister
                    : handleNext
                }
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  step > 1 &&
                    styles.primaryButtonWithBack,
                  pressed &&
                    !isLoading &&
                    styles.primaryButtonPressed,
                  isLoading &&
                    styles.primaryButtonDisabled,
                ]}
              >
                {isLoading ? (
                  <View
                    style={
                      styles.loadingContent
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Creating account...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={
                      styles.primaryButtonContent
                    }
                  >
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      {step === 4
                        ? "Create account"
                        : "Continue"}
                    </Text>

                    <Ionicons
                      name={
                        step === 4
                          ? "checkmark"
                          : "arrow-forward"
                      }
                      size={19}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </Pressable>
            </View>

            {/* ================================= */}
            {/* LOGIN */}
            {/* ================================= */}

            <View
              style={styles.loginSection}
            >
              <View
                style={
                  styles.loginDivider
                }
              >
                <View
                  style={styles.divider}
                />

                <Text
                  style={
                    styles.dividerText
                  }
                >
                  OR
                </Text>

                <View
                  style={styles.divider}
                />
              </View>

              <Text
                style={
                  styles.loginQuestion
                }
              >
                Already have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.replace(
                    "/(auth)/login"
                  )
                }
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    styles.loginButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Sign in
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#2563EB"
                />
              </Pressable>
            </View>
          </View>

          {/* ================================= */}
          {/* FOOTER */}
          {/* ================================= */}

          <View style={styles.footer}>
            <View
              style={
                styles.securityRow
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#64748B"
              />

              <Text
                style={
                  styles.securityText
                }
              >
                Secure and protected access
              </Text>
            </View>

            <Text
              style={styles.footerText}
            >
              ACE NextGen • Participant Portal
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ====================================== */}
      {/* DATE PICKER MODAL */}
      {/* ====================================== */}

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDatePicker(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowDatePicker(false)
          }
        >
          <Pressable
            style={styles.dateModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Date of Birth
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select your birth date
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowDatePicker(false)
                }
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <DateTimePicker
              value={parsedBirthDate}
              mode="date"
              display={
                Platform.OS === "ios"
                  ? "spinner"
                  : "calendar"
              }
              maximumDate={
                new Date()
              }
              onChange={
                handleBirthDateChange
              }
              style={
                styles.datePicker
              }
            />

            {Platform.OS === "ios" && (
              <Pressable
                onPress={() =>
                  setShowDatePicker(
                    false
                  )
                }
                style={
                  styles.modalDoneButton
                }
              >
                <Text
                  style={
                    styles.modalDoneText
                  }
                >
                  Done
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ====================================== */}
      {/* GENDER MODAL */}
      {/* ====================================== */}

      <Modal
        visible={
          showGenderDropdown
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowGenderDropdown(
            false
          )
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowGenderDropdown(
              false
            )
          }
        >
          <Pressable
            style={
              styles.selectionModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Gender
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose an option
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowGenderDropdown(
                    false
                  )
                }
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.optionList
              }
            >
              {genderOptions.map(
                (option) => {
                  const selected =
                    gender ===
                    option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setGender(
                          option
                        );

                        setShowGenderDropdown(
                          false
                        );
                      }}
                      style={({ pressed }) => [
                        styles.optionItem,
                        selected &&
                          styles.optionItemSelected,
                        pressed &&
                          styles.optionItemPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            option ===
                            "Male"
                              ? "male-outline"
                              : option ===
                                  "Female"
                                ? "female-outline"
                                : "person-outline"
                          }
                          size={20}
                          color={
                            selected
                              ? "#FFFFFF"
                              : "#2563EB"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#2563EB"
                          style={
                            styles.optionCheck
                          }
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ====================================== */}
      {/* LOCATION MODAL */}
      {/* ====================================== */}

      <Modal
        visible={
          activeDropdown !==
          null
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setActiveDropdown(
            null
          )
        }
      >
        <View
          style={
            styles.locationModalOverlay
          }
        >
          <Pressable
            style={
              styles.locationBackdrop
            }
            onPress={() =>
              setActiveDropdown(
                null
              )
            }
          />

          <View
            style={
              styles.locationModal
            }
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {locationTitle}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select from the list below
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setActiveDropdown(
                    null
                  )
                }
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.locationList
              }
            >
              {locationItems.length ===
              0 ? (
                <View
                  style={
                    styles.emptyLocation
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={30}
                    color="#94A3B8"
                  />

                  <Text
                    style={
                      styles.emptyLocationText
                    }
                  >
                    No locations
                    available.
                  </Text>
                </View>
              ) : (
                locationItems.map(
                  (item) => (
                    <Pressable
                      key={item.code}
                      onPress={() =>
                        handleLocationItemPress(
                          item
                        )
                      }
                      style={({ pressed }) => [
                        styles.locationItem,
                        pressed &&
                          styles.locationItemPressed,
                      ]}
                    >
                      <View
                        style={
                          styles.locationIcon
                        }
                      >
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#2563EB"
                        />
                      </View>

                      <Text
                        style={
                          styles.locationItemText
                        }
                      >
                        {item.name}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#CBD5E1"
                      />
                    </Pressable>
                  )
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ======================================================
// STEP INFORMATION
// ======================================================

const stepTitles: Record<
  Step,
  string
> = {
  1: "Account Information",
  2: "Personal Information",
  3: "Address Information",
  4: "Profile Picture",
};

const stepDescriptions: Record<
  Step,
  string
> = {
  1: "Create your account credentials.",
  2: "Tell us a little about yourself.",
  3: "Enter your current residential address.",
  4: "Add a profile picture to complete your account.",
};

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  header: {
    width: "100%",
    alignItems: "center",
  },

  logoRow: {
    width: "100%",
    height: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backButtonPressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  // --------------------------------------------------
  // CONTENT
  // --------------------------------------------------

  content: {
    width: "100%",
  },

  welcomeTitle: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#111827",
  },

  welcomeSubtitle: {
    marginTop: 8,
    maxWidth: 340,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  // --------------------------------------------------
  // GOOGLE INFO
  // --------------------------------------------------

  googleInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  googleInfoContent: {
    flex: 1,
    marginLeft: 9,
  },

  googleInfoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },

  googleInfoText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#475569",
  },

  googleEmailNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
  },

  googleEmailNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    color: "#475569",
  },

  // --------------------------------------------------
  // STEP INDICATOR
  // --------------------------------------------------

  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 11,
  },

  stepCircle: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  stepCircleActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },

  stepCircleCompleted: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },

  stepNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
  },

  stepNumberActive: {
    color: "#FFFFFF",
  },

  stepLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 6,
    backgroundColor: "#E2E8F0",
  },

  stepLineActive: {
    backgroundColor: "#2563EB",
  },

  stepTitle: {
    marginBottom: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  // --------------------------------------------------
  // FIELDS
  // --------------------------------------------------

  field: {
    marginTop: 19,
  },

  nameRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },

  nameField: {
    flex: 1,
  },

  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  inputWrapper: {
    width: "100%",
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  inputWrapperActive: {
    borderColor: "#93C5FD",
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 53,
    paddingVertical: 0,
    fontSize: 14,
    color: "#111827",
  },

  eyeButton: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  dropdownPlaceholder: {
    color: "#A0AEC0",
  },

  dropdownPressed: {
    opacity: 0.75,
  },

  dropdownDisabled: {
    opacity: 0.55,
  },

  // --------------------------------------------------
  // PROFILE INTRO
  // --------------------------------------------------

  profileIntro: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  profileIntroTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
  },

  profileIntroText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  // --------------------------------------------------
  // PROFILE IMAGE
  // --------------------------------------------------

  profileSection: {
    marginTop: 20,
  },

  profilePicker: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    borderRadius: 14,
    backgroundColor: "#F8FBFF",
    overflow: "hidden",
  },

  profilePickerPressed: {
    opacity: 0.75,
  },

  profileIconCircle: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "#EFF6FF",
  },

  profileTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  profileSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#94A3B8",
  },

  profileImage: {
    width: 190,
    height: 190,
  },

  profileOverlay: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#2563EB",
  },

  // --------------------------------------------------
  // ACCOUNT SUMMARY
  // --------------------------------------------------

  accountSummary: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  summaryTitle: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },

  summaryLabel: {
    width: 70,
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },

  summaryValue: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#334155",
  },

  // --------------------------------------------------
  // ADDRESS
  // --------------------------------------------------

  addressPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  addressContent: {
    flex: 1,
    marginLeft: 9,
  },

  addressLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  addressText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#334155",
  },

  // --------------------------------------------------
  // INFO / SECURITY
  // --------------------------------------------------

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    lineHeight: 17,
    color: "#475569",
  },

  passwordRules: {
    marginTop: 18,
    padding: 14,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  passwordRulesTitle: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  ruleText: {
    marginLeft: 8,
    fontSize: 11,
    color: "#64748B",
  },

  securityBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 13,
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  securityBoxText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    lineHeight: 17,
    color: "#475569",
  },

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: "#B91C1C",
  },

  // --------------------------------------------------
  // ACTION BUTTONS
  // --------------------------------------------------

  actionArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 25,
  },

  primaryButton: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  primaryButtonWithBack: {
    flex: 1,
  },

  primaryButtonContent: {
    width: "100%",
    height: 55,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  primaryButtonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  secondaryButton: {
    height: 55,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
  },

  secondaryButtonPressed: {
    opacity: 0.7,
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  // --------------------------------------------------
  // LOGIN SECTION
  // --------------------------------------------------

  loginSection: {
    marginTop: 28,
  },

  loginDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },

  loginQuestion: {
    marginTop: 17,
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
  },

  loginButton: {
    width: "100%",
    height: 50,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
  },

  loginButtonPressed: {
    opacity: 0.7,
  },

  loginButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------

  footer: {
    alignItems: "center",
    marginTop: 30,
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  securityText: {
    marginLeft: 6,
    fontSize: 10,
    color: "#64748B",
  },

  footerText: {
    marginTop: 9,
    fontSize: 9,
    color: "#CBD5E1",
  },

  // --------------------------------------------------
  // MODALS
  // --------------------------------------------------

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
  },

  dateModal: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  selectionModal: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  datePicker: {
    alignSelf: "center",
    marginTop: 12,
  },

  modalDoneButton: {
    height: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#2563EB",
  },

  modalDoneText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  optionList: {
    marginTop: 18,
  },

  optionItem: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginBottom: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  optionItemSelected: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
  },

  optionItemPressed: {
    opacity: 0.7,
  },

  optionIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
  },

  optionIconSelected: {
    backgroundColor: "#2563EB",
  },

  optionText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  optionTextSelected: {
    color: "#2563EB",
    fontWeight: "800",
  },

  optionCheck: {
    marginLeft: 8,
  },

  // --------------------------------------------------
  // LOCATION BOTTOM SHEET
  // --------------------------------------------------

  locationModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  locationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
  },

  locationModal: {
    width: "100%",
    maxHeight: "78%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },

  locationList: {
    paddingTop: 17,
    paddingBottom: 10,
  },

  locationItem: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  locationItemPressed: {
    opacity: 0.65,
    backgroundColor: "#F8FAFC",
  },

  locationIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
  },

  locationItemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  emptyLocation: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
  },

  emptyLocationText: {
    marginTop: 10,
    fontSize: 12,
    color: "#94A3B8",
  },
});