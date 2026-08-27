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

import * as ImagePicker from "expo-image-picker";

import DateTimePicker from "@react-native-community/datetimepicker";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  useRegister,
  type RegisterFormValues,
} from "@/hooks/UseRegister";

import { authApi } from "@/api/api";


// =============================================================
// TYPES
// =============================================================

type Step = 1 | 2 | 3;

type ProfileImage = {
  uri: string;
  name: string;
  type: string;
};

type LocationItem = {
  code: string;
  name: string;
};


// =============================================================
// PSGC API
// =============================================================

const PSGC_API =
  "https://psgc.gitlab.io/api";


// =============================================================
// COMPONENT
// =============================================================

export default function RegisterForm() {

  const router = useRouter();


  // ===========================================================
  // STEP
  // ===========================================================

  const [step, setStep] =
    useState<Step>(1);


  // ===========================================================
  // PERSONAL INFORMATION
  // ===========================================================

  const [firstName, setFirstName] =
    useState("");

  const [middleName, setMiddleName] =
    useState("");

  const [lastName, setLastName] =
    useState("");


  // ===========================================================
  // ADDRESS
  // ===========================================================

  const [houseNumber, setHouseNumber] =
    useState("");

  const [province, setProvince] =
    useState<LocationItem | null>(null);

  const [municipality, setMunicipality] =
    useState<LocationItem | null>(null);

  const [barangay, setBarangay] =
    useState<LocationItem | null>(null);


  // ===========================================================
  // BIRTH DATE
  // ===========================================================

  const [birthDate, setBirthDate] =
    useState("");

  const [showDatePicker, setShowDatePicker] =
    useState(false);


  // ===========================================================
  // GENDER
  // ===========================================================

  const [gender, setGender] =
    useState("");

  const [showGenderDropdown, setShowGenderDropdown] =
    useState(false);


  const genderOptions = [
    "Male",
    "Female",
    "Prefer not to say",
  ];


  // ===========================================================
  // PROFILE IMAGE
  // ===========================================================

  const [profileImage, setProfileImage] =
    useState<ProfileImage | undefined>(
      undefined
    );


  // ===========================================================
  // ACCOUNT
  // ===========================================================

  const [email, setEmail] =
    useState("");

  const [mobileNumber, setMobileNumber] =
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


  // ===========================================================
  // LOCATION DATA
  // ===========================================================

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


  // ===========================================================
  // DROPDOWN
  // ===========================================================

  type DropdownType =
    | "province"
    | "municipality"
    | "barangay"
    | null;

  const [activeDropdown, setActiveDropdown] =
    useState<DropdownType>(null);


  // ===========================================================
  // ERROR
  // ===========================================================

  const [localError, setLocalError] =
    useState<string | null>(null);


  // ===========================================================
  // REGISTER HOOK
  // ===========================================================

  const {
    register,
    isLoading,
    error,
  } = useRegister(authApi);


  // ===========================================================
  // LOAD PROVINCES
  // ===========================================================

  useEffect(() => {

    loadProvinces();

  }, []);


  const loadProvinces =
    async () => {

      try {

        setIsLoadingProvinces(true);

        const response =
          await fetch(
            `${PSGC_API}/provinces/`
          );


        if (!response.ok) {
          throw new Error(
            "Unable to load provinces."
          );
        }


        const data =
          await response.json();


        setProvinces(
          data.map(
            (item: any) => ({
              code: item.code,
              name: item.name,
            })
          )
        );

      }

      catch (error) {

        console.log(
          "Province API error:",
          error
        );

        setLocalError(
          "Unable to load provinces. Please check your internet connection."
        );

      }

      finally {

        setIsLoadingProvinces(false);

      }

    };


  // ===========================================================
  // LOAD MUNICIPALITIES
  // ===========================================================

  const loadMunicipalities =
    async (
      provinceCode: string
    ) => {

      try {

        setIsLoadingMunicipalities(true);

        setMunicipalities([]);

        setBarangays([]);

        setMunicipality(null);

        setBarangay(null);


        const response =
          await fetch(
            `${PSGC_API}/provinces/${provinceCode}/municipalities/`
          );


        if (!response.ok) {
          throw new Error(
            "Unable to load municipalities."
          );
        }


        const data =
          await response.json();


        setMunicipalities(
          data.map(
            (item: any) => ({
              code: item.code,
              name: item.name,
            })
          )
        );

      }

      catch (error) {

        console.log(
          "Municipality API error:",
          error
        );

        setLocalError(
          "Unable to load municipalities."
        );

      }

      finally {

        setIsLoadingMunicipalities(false);

      }

    };


  // ===========================================================
  // LOAD BARANGAYS
  // ===========================================================

  const loadBarangays =
    async (
      municipalityCode: string
    ) => {

      try {

        setIsLoadingBarangays(true);

        setBarangays([]);

        setBarangay(null);


        const response =
          await fetch(
            `${PSGC_API}/municipalities/${municipalityCode}/barangays/`
          );


        if (!response.ok) {
          throw new Error(
            "Unable to load barangays."
          );
        }


        const data =
          await response.json();


        setBarangays(
          data.map(
            (item: any) => ({
              code: item.code,
              name: item.name,
            })
          )
        );

      }

      catch (error) {

        console.log(
          "Barangay API error:",
          error
        );

        setLocalError(
          "Unable to load barangays."
        );

      }

      finally {

        setIsLoadingBarangays(false);

      }

    };


  // ===========================================================
  // ADDRESS STRING
  // ===========================================================

  const address =
    useMemo(() => {

      return [
        houseNumber.trim(),
        barangay?.name,
        municipality?.name,
        province?.name,
      ]
        .filter(Boolean)
        .join(", ");

    }, [
      houseNumber,
      barangay,
      municipality,
      province,
    ]);


  // ===========================================================
  // PROFILE IMAGE
  // ===========================================================

  const pickProfileImage =
    async () => {

      try {

        setLocalError(null);


        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();


        if (!permission.granted) {

          setLocalError(
            "Please allow access to your photos."
          );

          return;
        }


        const result =
          await ImagePicker
            .launchImageLibraryAsync({

              mediaTypes: ["images"],

              allowsEditing: true,

              aspect: [1, 1],

              quality: 0.8,

            });


        if (result.canceled) {
          return;
        }


        const asset =
          result.assets?.[0];


        if (!asset?.uri) {

          setLocalError(
            "Unable to select the image."
          );

          return;
        }


        const image: ProfileImage = {

          uri:
            asset.uri,

          name:
            asset.fileName ??
            `profile-${Date.now()}.jpg`,

          type:
            asset.mimeType ??
            "image/jpeg",

        };


        setProfileImage(image);

      }

      catch (error) {

        setLocalError(
          error instanceof Error
            ? error.message
            : "Unable to select profile image."
        );

      }

    };


  // ===========================================================
  // DATE
  // ===========================================================

 const handleDateChange = (
  event: any,
  selectedDate?: Date
) => {

  if (
    event?.type === "dismissed"
  ) {
    return;
  }

  if (!selectedDate) {
    return;
  }

  const year =
    selectedDate.getFullYear();

  const month =
    String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      selectedDate.getDate()
    ).padStart(2, "0");

  setBirthDate(
    `${year}-${month}-${day}`
  );

  // Android closes automatically
  if (Platform.OS === "android") {
    setShowDatePicker(false);
  }
};


  // ===========================================================
  // DATE DISPLAY
  // ===========================================================

  const formattedBirthDate =
    birthDate
      ? new Date(
          `${birthDate}T00:00:00`
        ).toLocaleDateString(
          "en-PH",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "";


  // ===========================================================
  // DROPDOWN SELECTION
  // ===========================================================

  const handleProvinceSelect =
    async (
      item: LocationItem
    ) => {

      setProvince(item);

      setActiveDropdown(null);

      await loadMunicipalities(
        item.code
      );

    };


  const handleMunicipalitySelect =
    async (
      item: LocationItem
    ) => {

      setMunicipality(item);

      setActiveDropdown(null);

      await loadBarangays(
        item.code
      );

    };


  const handleBarangaySelect =
    (
      item: LocationItem
    ) => {

      setBarangay(item);

      setActiveDropdown(null);

    };


  // ===========================================================
  // STEP 1 VALIDATION
  // ===========================================================

  const validateStepOne =
    () => {

      setLocalError(null);


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


      if (!houseNumber.trim()) {

        setLocalError(
          "Please enter your house number and street."
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


  // ===========================================================
  // STEP 2 VALIDATION
  // ===========================================================

  const validateStepTwo =
    () => {

      setLocalError(null);


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


      if (!mobileNumber.trim()) {

        setLocalError(
          "Please enter your mobile number."
        );

        return false;
      }


      return true;

    };


  // ===========================================================
  // STEP 3 VALIDATION
  // ===========================================================

  const validateStepThree =
    () => {

      setLocalError(null);


      if (!password) {

        setLocalError(
          "Please enter a password."
        );

        return false;
      }


      if (
        password.length < 8
      ) {

        setLocalError(
          "Password must contain at least 8 characters."
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


      return true;

    };


  // ===========================================================
  // NEXT
  // ===========================================================

  const handleNext = () => {

    setLocalError(null);


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

    }

  };


  // ===========================================================
  // BACK
  // ===========================================================

  const handleBack = () => {

    setLocalError(null);


    if (step === 1) {

      router.back();

      return;
    }


    setStep(
      current =>
        (current - 1) as Step
    );

  };


  // ===========================================================
  // REGISTER
  // ===========================================================

  const handleRegister =
    async () => {

      if (!validateStepThree()) {
        return;
      }


      // IMPORTANT:
      // structured address -> one string
      //
      // Example:
      // 123 Rizal St, San Jose,
      // Rodriguez, Rizal

      const values: RegisterFormValues = {

        firstName:
          firstName.trim(),

        middleName:
          middleName.trim(),

        lastName:
          lastName.trim(),

        address:
          address,

        birthDate:
          birthDate,

        gender:
          gender,

        email:
          email
            .trim()
            .toLowerCase(),

        mobileNumber:
          mobileNumber.trim(),

        password,

        profileImage,

      };


      const registered =
        await register(values);


      if (!registered) {
        return;
      }


      try {

        const otpResponse =
          await authApi.sendOtp({

            email:
              email
                .trim()
                .toLowerCase(),

          });


        if (!otpResponse.success) {

          setLocalError(
            otpResponse.message ||
              "Unable to send verification code."
          );

          return;
        }


        Alert.alert(

          "Registration Successful",

          "A verification code has been sent to your email.",

          [
            {
              text: "OK",

              onPress: () => {

                router.push({
                  pathname:
                    "/(auth)/otp-verification",

                  params: {
                    email:
                      email
                        .trim()
                        .toLowerCase(),
                  },
                });

              },

            },

          ]

        );

      }

      catch (error) {

        setLocalError(
          error instanceof Error
            ? error.message
            : "Unable to send verification code."
        );

      }

    };


  // ===========================================================
  // ERROR
  // ===========================================================

  const displayError =
    localError || error;


  // ===========================================================
  // STEP TITLE
  // ===========================================================

  const stepTitle =
    step === 1
      ? "Personal Information"
      : step === 2
      ? "Contact Information"
      : "Account Security";


  const stepDescription =
    step === 1
      ? "Tell us a little about yourself."
      : step === 2
      ? "We'll use these details to secure your account."
      : "Create a secure password for your account.";


  // ===========================================================
  // DROPDOWN DATA
  // ===========================================================

  const dropdownItems =
    activeDropdown === "province"
      ? provinces
      : activeDropdown === "municipality"
      ? municipalities
      : barangays;


  const dropdownTitle =
    activeDropdown === "province"
      ? "Select Province"
      : activeDropdown === "municipality"
      ? "Select Municipality / City"
      : "Select Barangay";


  // ===========================================================
  // UI
  // ===========================================================

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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scroll
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={styles.header}
          >

            <Pressable
              onPress={handleBack}
              disabled={isLoading}
              style={
                styles.backButton
              }
            >

              <Ionicons
                name="arrow-back"
                size={20}
                color="#0F172A"
              />

            </Pressable>


            <View
              style={
                styles.headerBrand
              }
            >

              <View
                style={styles.logo}
              >

                <Text
                  style={
                    styles.logoText
                  }
                >
                  A
                </Text>

              </View>


              <View>

                <Text
                  style={
                    styles.brandName
                  }
                >
                  ACE NEXTGEN
                </Text>


                <Text
                  style={
                    styles.brandCaption
                  }
                >
                  PARTICIPANT PORTAL
                </Text>

              </View>

            </View>


            <View
              style={
                styles.headerSpacer
              }
            />

          </View>


          {/* ==================================================
              INTRO
          ================================================== */}

          <View
            style={styles.intro}
          >

            <Text
              style={
                styles.introEyebrow
              }
            >
              CREATE ACCOUNT
            </Text>


            <Text
              style={
                styles.introTitle
              }
            >
              Join ACE NextGen
            </Text>


            <Text
              style={
                styles.introDescription
              }
            >
              Create your participant
              account and start your
              learning journey.
            </Text>

          </View>


          {/* ==================================================
              CARD
          ================================================== */}

          <View
            style={styles.card}
          >

            {/* =================================================
                PROGRESS
            ================================================= */}

            <View
              style={
                styles.progressContainer
              }
            >

              {[1, 2, 3].map(
                item => {

                  const active =
                    item <= step;

                  const completed =
                    item < step;


                  return (

                    <React.Fragment
                      key={item}
                    >

                      <View
                        style={[
                          styles.progressStep,

                          active &&
                            styles.progressStepActive,
                        ]}
                      >

                        {completed ? (

                          <Ionicons
                            name="checkmark"
                            size={13}
                            color="#FFFFFF"
                          />

                        ) : (

                          <Text
                            style={[
                              styles.progressNumber,

                              active &&
                                styles.progressNumberActive,
                            ]}
                          >
                            {item}
                          </Text>

                        )}

                      </View>


                      {item < 3 && (

                        <View
                          style={[
                            styles.progressLine,

                            item < step &&
                              styles.progressLineActive,
                          ]}
                        />

                      )}

                    </React.Fragment>

                  );

                }
              )}

            </View>


            <View
              style={
                styles.stepCounter
              }
            >

              <Text
                style={
                  styles.stepCounterText
                }
              >
                STEP {step} OF 3
              </Text>

            </View>


            {/* =================================================
                CARD HEADER
            ================================================= */}

            <View
              style={
                styles.cardHeader
              }
            >

              <View
                style={styles.badge}
              >

                <Ionicons
                  name={
                    step === 1
                      ? "person-outline"
                      : step === 2
                      ? "call-outline"
                      : "shield-checkmark-outline"
                  }
                  size={14}
                  color="#2563EB"
                />


                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {stepTitle.toUpperCase()}
                </Text>

              </View>


              <Text
                style={
                  styles.cardTitle
                }
              >
                {stepTitle}
              </Text>


              <Text
                style={
                  styles.cardSubtitle
                }
              >
                {stepDescription}
              </Text>

            </View>


            {/* =================================================
                STEP 1
            ================================================= */}

            {step === 1 && (

              <View>

                {/* FIRST NAME */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    FIRST NAME
                  </Text>


                  <Input
                    icon="person-outline"
                    value={firstName}
                    onChangeText={
                      setFirstName
                    }
                    placeholder="Juan"
                    disabled={isLoading}
                  />

                </View>


                {/* MIDDLE NAME */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    MIDDLE NAME

                    <Text
                      style={
                        styles.optional
                      }
                    >
                      {" "}
                      OPTIONAL
                    </Text>

                  </Text>


                  <Input
                    icon="person-outline"
                    value={middleName}
                    onChangeText={
                      setMiddleName
                    }
                    placeholder="Middle name"
                    disabled={isLoading}
                  />

                </View>


                {/* LAST NAME */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    LAST NAME
                  </Text>


                  <Input
                    icon="person-outline"
                    value={lastName}
                    onChangeText={
                      setLastName
                    }
                    placeholder="Dela Cruz"
                    disabled={isLoading}
                  />

                </View>


                {/* =================================================
                    HOUSE NUMBER
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    HOUSE NUMBER / STREET
                  </Text>


                  <Input
                    icon="home-outline"
                    value={houseNumber}
                    onChangeText={
                      setHouseNumber
                    }
                    placeholder="123 Rizal Street"
                    disabled={isLoading}
                  />

                </View>


                {/* =================================================
                    PROVINCE
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    PROVINCE
                  </Text>


                  <DropdownButton
                    icon="map-outline"
                    value={
                      province?.name
                    }
                    placeholder={
                      isLoadingProvinces
                        ? "Loading provinces..."
                        : "Select province"
                    }
                    disabled={
                      isLoading ||
                      isLoadingProvinces
                    }
                    onPress={() =>
                      setActiveDropdown(
                        "province"
                      )
                    }
                  />

                </View>


                {/* =================================================
                    MUNICIPALITY
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    MUNICIPALITY / CITY
                  </Text>


                  <DropdownButton
                    icon="business-outline"
                    value={
                      municipality?.name
                    }
                    placeholder={
                      !province
                        ? "Select province first"
                        : isLoadingMunicipalities
                        ? "Loading municipalities..."
                        : "Select municipality / city"
                    }
                    disabled={
                      isLoading ||
                      !province ||
                      isLoadingMunicipalities
                    }
                    onPress={() =>
                      setActiveDropdown(
                        "municipality"
                      )
                    }
                  />

                </View>


                {/* =================================================
                    BARANGAY
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    BARANGAY
                  </Text>


                  <DropdownButton
                    icon="location-outline"
                    value={
                      barangay?.name
                    }
                    placeholder={
                      !municipality
                        ? "Select municipality first"
                        : isLoadingBarangays
                        ? "Loading barangays..."
                        : "Select barangay"
                    }
                    disabled={
                      isLoading ||
                      !municipality ||
                      isLoadingBarangays
                    }
                    onPress={() =>
                      setActiveDropdown(
                        "barangay"
                      )
                    }
                  />

                </View>


                {/* =================================================
                    ADDRESS PREVIEW
                ================================================= */}

                {address && (

                  <View
                    style={
                      styles.addressPreview
                    }
                  >

                    <View
                      style={
                        styles.addressPreviewIcon
                      }
                    >

                      <Ionicons
                        name="location"
                        size={17}
                        color="#2563EB"
                      />

                    </View>


                    <View
                      style={
                        styles.addressPreviewContent
                      }
                    >

                      <Text
                        style={
                          styles.addressPreviewLabel
                        }
                      >
                        COMPLETE ADDRESS
                      </Text>


                      <Text
                        style={
                          styles.addressPreviewText
                        }
                      >
                        {address}
                      </Text>

                    </View>

                  </View>

                )}


                {/* =================================================
                    BIRTH DATE
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    BIRTH DATE
                  </Text>


                  <Pressable
                    onPress={() =>
                      setShowDatePicker(true)
                    }
                    disabled={isLoading}
                    style={
                      styles.inputWrapper
                    }
                  >

                    <View
                      style={
                        styles.inputIcon
                      }
                    >

                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#2563EB"
                      />

                    </View>


                    <Text
                      style={[
                        styles.dateText,

                        !birthDate &&
                          styles.placeholderText,
                      ]}
                    >
                      {formattedBirthDate ||
                        "Select your birth date"}
                    </Text>


                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#64748B"
                    />

                  </Pressable>

                </View>


                {/* =================================================
                    DATE PICKER
                ================================================= */}

              {showDatePicker && (
  <Modal
    visible={showDatePicker}
    transparent
    animationType="fade"
    onRequestClose={() =>
      setShowDatePicker(false)
    }
  >
    <View style={styles.dateModalOverlay}>

      <View style={styles.dateModal}>

        {/* HEADER */}
        <View style={styles.dateModalHeader}>

          <View>
            <Text style={styles.dateModalTitle}>
              Date of Birth
            </Text>

            <Text style={styles.dateModalSubtitle}>
              Select your birth date
            </Text>
          </View>

          <Pressable
            onPress={() =>
              setShowDatePicker(false)
            }
            style={styles.modalClose}
          >
            <Ionicons
              name="close"
              size={20}
              color="#475569"
            />
          </Pressable>

        </View>


        {/* DATE PICKER */}

        <View style={styles.datePickerContainer}>

          <DateTimePicker
            value={
              birthDate
                ? new Date(
                    `${birthDate}T00:00:00`
                  )
                : new Date(
                    2000,
                    0,
                    1
                  )
            }

            mode="date"

            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }

            maximumDate={
              new Date()
            }

            themeVariant="light"

            textColor="#0F172A"

            accentColor="#2563EB"

            onChange={
              handleDateChange
            }

            style={
              styles.datePicker
            }
          />

        </View>


        {/* DONE */}

        <Pressable
          onPress={() =>
            setShowDatePicker(false)
          }
          style={
            styles.dateDoneButton
          }
        >

          <Text
            style={
              styles.dateDoneText
            }
          >
            Done
          </Text>

          <Ionicons
            name="checkmark"
            size={18}
            color="#FFFFFF"
          />

        </Pressable>

      </View>

    </View>
  </Modal>
)}

                {/* =================================================
                    GENDER
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    GENDER
                  </Text>


                  <Pressable
                    onPress={() =>
                      setShowGenderDropdown(
                        true
                      )
                    }
                    disabled={isLoading}
                    style={
                      styles.inputWrapper
                    }
                  >

                    <View
                      style={
                        styles.inputIcon
                      }
                    >

                      <Ionicons
                        name="people-outline"
                        size={18}
                        color="#2563EB"
                      />

                    </View>


                    <Text
                      style={[
                        styles.dateText,

                        !gender &&
                          styles.placeholderText,
                      ]}
                    >
                      {gender ||
                        "Select gender"}
                    </Text>


                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#64748B"
                    />

                  </Pressable>

                </View>


                {/* =================================================
                    PROFILE IMAGE
                ================================================= */}

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    PROFILE IMAGE

                    <Text
                      style={
                        styles.optional
                      }
                    >
                      {" "}
                      OPTIONAL
                    </Text>

                  </Text>


                  <Pressable
                    onPress={
                      pickProfileImage
                    }
                    disabled={isLoading}
                    style={
                      styles.imagePicker
                    }
                  >

                    {profileImage ? (

                      <Image
                        source={{
                          uri:
                            profileImage.uri,
                        }}
                        style={
                          styles.profilePreview
                        }
                      />

                    ) : (

                      <View
                        style={
                          styles.imagePlaceholder
                        }
                      >

                        <View
                          style={
                            styles.imageIconCircle
                          }
                        >

                          <Ionicons
                            name="camera-outline"
                            size={25}
                            color="#2563EB"
                          />

                        </View>


                        <Text
                          style={
                            styles.imagePickerText
                          }
                        >
                          Select Profile
                          Image
                        </Text>


                        <Text
                          style={
                            styles.imagePickerSubtext
                          }
                        >
                          JPG or PNG
                        </Text>

                      </View>

                    )}

                  </Pressable>


                  {profileImage && (

                    <Pressable
                      onPress={
                        pickProfileImage
                      }
                      disabled={
                        isLoading
                      }
                      style={
                        styles.changeImageButton
                      }
                    >

                      <Ionicons
                        name="image-outline"
                        size={15}
                        color="#2563EB"
                      />


                      <Text
                        style={
                          styles.changeImageText
                        }
                      >
                        Change Image
                      </Text>

                    </Pressable>

                  )}

                </View>

              </View>

            )}


            {/* =================================================
                STEP 2
            ================================================= */}

            {step === 2 && (

              <View>

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    EMAIL ADDRESS
                  </Text>


                  <Input
                    icon="mail-outline"
                    value={email}
                    onChangeText={
                      setEmail
                    }
                    placeholder="you@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={isLoading}
                  />

                </View>


                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    MOBILE NUMBER
                  </Text>


                  <Input
                    icon="call-outline"
                    value={mobileNumber}
                    onChangeText={
                      setMobileNumber
                    }
                    placeholder="09XXXXXXXXX"
                    keyboardType="phone-pad"
                    disabled={isLoading}
                  />

                </View>


                <View
                  style={
                    styles.infoBox
                  }
                >

                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#2563EB"
                  />


                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    Make sure your email
                    address is correct. A
                    verification code will
                    be sent after registration.
                  </Text>

                </View>

              </View>

            )}


            {/* =================================================
                STEP 3
            ================================================= */}

            {step === 3 && (

              <View>

                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    PASSWORD
                  </Text>


                  <View
                    style={
                      styles.inputWrapper
                    }
                  >

                    <View
                      style={
                        styles.inputIcon
                      }
                    >

                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#2563EB"
                      />

                    </View>


                    <TextInput
                      value={password}
                      onChangeText={
                        setPassword
                      }
                      placeholder="At least 8 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={
                        !showPassword
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      style={
                        styles.input
                      }
                    />


                    <Pressable
                      onPress={() =>
                        setShowPassword(
                          value =>
                            !value
                        )
                      }
                    >

                      <Ionicons
                        name={
                          showPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#64748B"
                      />

                    </Pressable>

                  </View>

                </View>


                <View
                  style={styles.field}
                >

                  <Text
                    style={
                      styles.label
                    }
                  >
                    CONFIRM PASSWORD
                  </Text>


                  <View
                    style={
                      styles.inputWrapper
                    }
                  >

                    <View
                      style={
                        styles.inputIcon
                      }
                    >

                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color="#2563EB"
                      />

                    </View>


                    <TextInput
                      value={
                        confirmPassword
                      }
                      onChangeText={
                        setConfirmPassword
                      }
                      placeholder="Repeat your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={
                        !showConfirmPassword
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      style={
                        styles.input
                      }
                    />


                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(
                          value =>
                            !value
                        )
                      }
                    >

                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#64748B"
                      />

                    </Pressable>

                  </View>

                </View>


                <View
                  style={
                    styles.securityBox
                  }
                >

                  <Ionicons
                    name="shield-checkmark"
                    size={19}
                    color="#2563EB"
                  />


                  <View
                    style={
                      styles.securityContent
                    }
                  >

                    <Text
                      style={
                        styles.securityTitle
                      }
                    >
                      Keep your account secure
                    </Text>


                    <Text
                      style={
                        styles.securityText
                      }
                    >
                      Use at least 8 characters
                      and avoid easily guessed
                      passwords.
                    </Text>

                  </View>

                </View>

              </View>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {displayError && (

              <View
                style={
                  styles.errorBox
                }
              >

                <Ionicons
                  name="alert-circle"
                  size={18}
                  color="#DC2626"
                />


                <Text
                  style={
                    styles.errorText
                  }
                >
                  {displayError}
                </Text>

              </View>

            )}


            {/* =================================================
                ACTIONS
            ================================================= */}

            <View
              style={styles.actions}
            >

              {step > 1 && (

                <Pressable
                  onPress={
                    handleBack
                  }
                  disabled={
                    isLoading
                  }
                  style={
                    styles.backAction
                  }
                >

                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#475569"
                  />


                  <Text
                    style={
                      styles.backActionText
                    }
                  >
                    Back
                  </Text>

                </Pressable>

              )}


              <Pressable
                onPress={
                  step === 3
                    ? handleRegister
                    : handleNext
                }
                disabled={
                  isLoading
                }
                style={[
                  styles.nextButton,

                  step === 1 &&
                    styles.nextButtonFull,

                  isLoading &&
                    styles.nextButtonDisabled,
                ]}
              >

                {isLoading ? (

                  <>

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />


                    <Text
                      style={
                        styles.nextButtonText
                      }
                    >
                      Creating...
                    </Text>

                  </>

                ) : (

                  <>

                    <Text
                      style={
                        styles.nextButtonText
                      }
                    >
                      {step === 3
                        ? "Create Account"
                        : "Continue"}
                    </Text>


                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />

                  </>

                )}

              </Pressable>

            </View>


            {/* =================================================
                LOGIN
            ================================================= */}

            <View
              style={
                styles.loginSection
              }
            >

              <Text
                style={
                  styles.loginText
                }
              >
                Already have an account?
              </Text>


              <Pressable
                onPress={() =>
                  router.back()
                }
              >

                <Text
                  style={
                    styles.loginLink
                  }
                >
                  Sign In
                </Text>

              </Pressable>

            </View>


            <Text
              style={
                styles.footer
              }
            >
              ACE NextGen • Participant Portal
            </Text>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>


      {/* =======================================================
          GENDER MODAL
      ======================================================= */}

      <Modal
        visible={
          showGenderDropdown
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowGenderDropdown(false)
        }
      >

        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setShowGenderDropdown(false)
          }
        >

          <Pressable
            style={
              styles.dropdownModal
            }
            onPress={event =>
              event.stopPropagation()
            }
          >

            <View
              style={
                styles.modalHeader
              }
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
                  Choose your preferred option
                </Text>

              </View>


              <Pressable
                onPress={() =>
                  setShowGenderDropdown(
                    false
                  )
                }
                style={
                  styles.modalClose
                }
              >

                <Ionicons
                  name="close"
                  size={20}
                  color="#475569"
                />

              </Pressable>

            </View>


            {genderOptions.map(
              option => (

                <Pressable
                  key={option}
                  onPress={() => {

                    setGender(option);

                    setShowGenderDropdown(
                      false
                    );

                  }}
                  style={[
                    styles.option,

                    gender === option &&
                      styles.optionSelected,
                  ]}
                >

                  <View
                    style={[
                      styles.optionIcon,

                      gender === option &&
                        styles.optionIconSelected,
                    ]}
                  >

                    <Ionicons
                      name={
                        option === "Male"
                          ? "male"
                          : option === "Female"
                          ? "female"
                          : "person-outline"
                      }
                      size={17}
                      color={
                        gender === option
                          ? "#FFFFFF"
                          : "#2563EB"
                      }
                    />

                  </View>


                  <Text
                    style={[
                      styles.optionText,

                      gender === option &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>


                  {gender === option && (

                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563EB"
                    />

                  )}

                </Pressable>

              )
            )}

          </Pressable>

        </Pressable>

      </Modal>


      {/* =======================================================
          LOCATION MODAL
      ======================================================= */}

      <Modal
        visible={
          activeDropdown !== null
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setActiveDropdown(null)
        }
      >

        <View
          style={
            styles.locationModalOverlay
          }
        >

          <Pressable
            style={
              styles.locationModalBackdrop
            }
            onPress={() =>
              setActiveDropdown(null)
            }
          />


          <View
            style={
              styles.locationModal
            }
          >

            <View
              style={
                styles.locationHandle
              }
            />


            <View
              style={
                styles.locationHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {dropdownTitle}
                </Text>


                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select one option
                </Text>

              </View>


              <Pressable
                onPress={() =>
                  setActiveDropdown(null)
                }
                style={
                  styles.modalClose
                }
              >

                <Ionicons
                  name="close"
                  size={20}
                  color="#475569"
                />

              </Pressable>

            </View>


            {dropdownItems.length === 0 ? (

              <View
                style={
                  styles.emptyLocation
                }
              >

                <Ionicons
                  name="location-outline"
                  size={32}
                  color="#94A3B8"
                />


                <Text
                  style={
                    styles.emptyLocationText
                  }
                >
                  No locations available.
                </Text>

              </View>

            ) : (

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.locationList
                }
              >

                {dropdownItems.map(
                  item => {

                    const selected =
                      activeDropdown ===
                        "province"
                        ? province?.code ===
                          item.code
                        : activeDropdown ===
                          "municipality"
                        ? municipality?.code ===
                          item.code
                        : barangay?.code ===
                          item.code;


                    return (

                      <Pressable
                        key={item.code}
                        onPress={() => {

                          if (
                            activeDropdown ===
                            "province"
                          ) {

                            handleProvinceSelect(
                              item
                            );

                          }

                          else if (
                            activeDropdown ===
                            "municipality"
                          ) {

                            handleMunicipalitySelect(
                              item
                            );

                          }

                          else {

                            handleBarangaySelect(
                              item
                            );

                          }

                        }}
                        style={[
                          styles.locationOption,

                          selected &&
                            styles.locationOptionSelected,
                        ]}
                      >

                        <View
                          style={
                            styles.locationIcon
                          }
                        >

                          <Ionicons
                            name="location-outline"
                            size={17}
                            color="#2563EB"
                          />

                        </View>


                        <Text
                          style={[
                            styles.locationText,

                            selected &&
                              styles.locationTextSelected,
                          ]}
                        >
                          {item.name}
                        </Text>


                        {selected && (

                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#2563EB"
                          />

                        )}

                      </Pressable>

                    );

                  }
                )}

              </ScrollView>

            )}

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// =============================================================
// REUSABLE INPUT
// =============================================================

function Input({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  disabled?: boolean;
}) {

  return (

    <View
      style={
        styles.inputWrapper
      }
    >

      <View
        style={
          styles.inputIcon
        }
      >

        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />

      </View>


      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize={
          autoCapitalize
        }
        editable={!disabled}
        style={
          styles.input
        }
      />

    </View>

  );
}


// =============================================================
// DROPDOWN BUTTON
// =============================================================

function DropdownButton({
  icon,
  value,
  placeholder,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  onPress: () => void;
}) {

  return (

    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.inputWrapper,

        disabled &&
          styles.inputDisabled,
      ]}
    >

      <View
        style={
          styles.inputIcon
        }
      >

        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />

      </View>


      <Text
        style={[
          styles.dateText,

          !value &&
            styles.placeholderText,
        ]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>


      <Ionicons
        name="chevron-down"
        size={18}
        color="#64748B"
      />

    </Pressable>

  );
}


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 35,
  },


  // ===========================================================
  // HEADER
  // ===========================================================

  header: {
    height: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  brandName: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#0F172A",
  },

  brandCaption: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: "#64748B",
  },

  headerSpacer: {
    width: 40,
  },


  // ===========================================================
  // INTRO
  // ===========================================================

  intro: {
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 21,
  },

  introEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    color: "#2563EB",
  },

  introTitle: {
    marginTop: 6,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#0F172A",
  },

  introDescription: {
    marginTop: 6,
    maxWidth: 340,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },


  // ===========================================================
  // CARD
  // ===========================================================

  card: {
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },


  // ===========================================================
  // PROGRESS
  // ===========================================================

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  progressStep: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  progressStepActive: {
    backgroundColor: "#2563EB",
  },

  progressNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
  },

  progressNumberActive: {
    color: "#FFFFFF",
  },

  progressLine: {
    width: 46,
    height: 2,
    backgroundColor: "#E2E8F0",
  },

  progressLineActive: {
    backgroundColor: "#2563EB",
  },

  stepCounter: {
    alignItems: "center",
    marginBottom: 22,
  },

  stepCounterText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#94A3B8",
  },


  // ===========================================================
  // CARD HEADER
  // ===========================================================

  cardHeader: {
    marginBottom: 24,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
    marginBottom: 12,
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  cardTitle: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#0F172A",
  },

  cardSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },


  // ===========================================================
  // FORM
  // ===========================================================

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#64748B",
  },

  optional: {
    color: "#94A3B8",
    fontWeight: "600",
  },

  inputWrapper: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
  },

  inputDisabled: {
    opacity: 0.55,
  },

  inputIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    minHeight: 53,
    fontSize: 14,
    color: "#0F172A",
  },

  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },

  placeholderText: {
    color: "#94A3B8",
  },


  // ===========================================================
  // ADDRESS PREVIEW
  // ===========================================================

  addressPreview: {
    flexDirection: "row",
    padding: 13,
    marginTop: -3,
    marginBottom: 18,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  addressPreviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  addressPreviewContent: {
    flex: 1,
    marginLeft: 9,
  },

  addressPreviewLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  addressPreviewText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#334155",
  },


  // ===========================================================
  // PROFILE IMAGE
  // ===========================================================

  imagePicker: {
    width: "100%",
    minHeight: 155,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },

  imageIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  imagePickerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  imagePickerSubtext: {
    marginTop: 4,
    fontSize: 10,
    color: "#94A3B8",
  },

  profilePreview: {
    width: 155,
    height: 155,
    borderRadius: 77.5,
  },

  changeImageButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  changeImageText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },


  // ===========================================================
  // INFO
  // ===========================================================

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 13,
    marginTop: 2,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 17,
    color: "#475569",
  },


  // ===========================================================
  // SECURITY
  // ===========================================================

  securityBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  securityText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
  },


  // ===========================================================
  // ERROR
  // ===========================================================

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginTop: 3,
    marginBottom: 18,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#B91C1C",
  },


  // ===========================================================
  // ACTIONS
  // ===========================================================

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },

  backAction: {
    height: 55,
    paddingHorizontal: 17,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  nextButton: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  nextButtonFull: {
    flex: 1,
  },

  nextButtonDisabled: {
    opacity: 0.6,
  },

  nextButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },


  // ===========================================================
  // LOGIN
  // ===========================================================

  loginSection: {
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
// ===========================================================
// DATE MODAL
// ===========================================================

dateModalOverlay: {
  flex: 1,

  backgroundColor:
    "rgba(15, 23, 42, 0.45)",

  alignItems: "center",

  justifyContent: "center",

  paddingHorizontal: 20,
},

dateModal: {
  width: "100%",

  backgroundColor: "#FFFFFF",

  borderRadius: 24,

  padding: 20,

  shadowColor: "#0F172A",

  shadowOpacity: 0.15,

  shadowRadius: 25,

  shadowOffset: {
    width: 0,
    height: 10,
  },

  elevation: 10,
},

dateModalHeader: {
  flexDirection: "row",

  alignItems: "center",

  justifyContent: "space-between",

  marginBottom: 12,
},

dateModalTitle: {
  fontSize: 19,

  fontWeight: "800",

  color: "#0F172A",
},

dateModalSubtitle: {
  marginTop: 3,

  fontSize: 11,

  color: "#64748B",
},

datePickerContainer: {
  alignItems: "center",

  justifyContent: "center",

  backgroundColor: "#F8FAFC",

  borderRadius: 18,

  borderWidth: 1,

  borderColor: "#E2E8F0",

  marginTop: 5,

  marginBottom: 15,

  overflow: "hidden",
},

datePicker: {
  width: "100%",

  height: 190,
},

dateDoneButton: {
  height: 52,

  borderRadius: 15,

  backgroundColor: "#2563EB",

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "center",

  gap: 8,
},

dateDoneText: {
  fontSize: 14,

  fontWeight: "800",

  color: "#FFFFFF",
},

  // ===========================================================
  // FOOTER
  // ===========================================================

  footer: {
    marginTop: 17,
    textAlign: "center",
    fontSize: 9,
    color: "#CBD5E1",
  },


  // ===========================================================
  // GENDER MODAL
  // ===========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  dropdownModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 8,
  },

  optionSelected: {
    backgroundColor: "#EEF4FF",
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  optionIconSelected: {
    backgroundColor: "#2563EB",
  },

  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  optionTextSelected: {
    color: "#2563EB",
    fontWeight: "800",
  },


  // ===========================================================
  // LOCATION MODAL
  // ===========================================================

  locationModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },

  locationModalBackdrop: {
    flex: 1,
  },

  locationModal: {
    maxHeight: "78%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },

  locationHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 17,
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  locationList: {
    paddingBottom: 15,
  },

  locationOption: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 7,
  },

  locationOptionSelected: {
    backgroundColor: "#EEF4FF",
  },

  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  locationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  locationTextSelected: {
    color: "#2563EB",
    fontWeight: "800",
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