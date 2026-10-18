"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import CountryPicker, {
  type CountryCode,
  type Country,
} from "react-native-country-picker-modal";

import {
  parsePhoneNumberFromString,
  isSupportedCountry,
  type CountryCode as PhoneCountryCode,
} from "libphonenumber-js";
import { AppAlert } from "@repo/ui-mobile";
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

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type ProfileImage = {
  uri: string;
  name: string;
  type: string;
};

type LocationItem = {
  code: string;
  name: string;
  region?: string | null;
  province?: string | null;
  type?: string | null;
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

const PSGC_API = "https://psgc.cloud/api/v2";
const CALOOCAN_BARANGAY_ALIASES: Record<string, string> = {
  "1380100168": "Deparo",
  "1380100169": "BF Homes Caloocan",
  "1380100170": "Deparo 2",
  "1380100171": "Bagumbong",
  "1380100172": "Urduja Village",
  "1380100173": "Congress",
  "1380100174": "Camarin (Central)",
  "1380100175": "Camarin",
  "1380100177": "Camarin (Cielito)",
  "1380100178": "Camarin (Kiko)",
  "1380100179": "Amparo",
  "1380100180": "Tala",
  "1380100181": "Pangarap Village",
  "1380100183": "Tala",
};

const getBarangayDisplayName = (
  item: LocationItem,
  municipalityCode?: string
): string => {
  if (municipalityCode === "1380100000") {
    return (
      CALOOCAN_BARANGAY_ALIASES[item.code] ??
      item.name.trim()
    );
  }

  return item.name.trim();
};

const GOOGLE_REGISTRATION_TOKEN_KEY =
  "google_registration_id_token";

const educationalStatusOptions = [
  "Currently Studying",
  "Undergraduate",
  "Graduated",
  "Not Currently Studying",
];

const employmentStatusOptions = [
  "Employed",
  "Self-Employed",
  "Unemployed",
  "Student",
  "Freelance",
  "Retired",
];

const validIdTypeOptions = [
  "Philippine National ID",
  "Passport",
  "Driver's License",
  "UMID",
  "PhilHealth ID",
  "Postal ID",
  "Voter's ID",
  "SSS ID",
  "PRC ID",
  "Senior Citizen ID",
  "PWD ID",
  "Other",
];

const genderOptions = [
  "Male",
  "Female",
  "Prefer not to say",
];

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
          color="#002B5C"
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

type SummaryRowProps = {
  label: string;
  value?: string | null;
};

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value?.trim() || "Not provided"}
      </Text>
    </View>
  );
}

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
          color="#002B5C"
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
            color="#002B5C"
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [
    activeOptionDropdown,
    setActiveOptionDropdown,
  ] = useState<
    "educationalStatus" | "employmentStatus" | "validIdType" | null
  >(null);

  const [appAlert, setAppAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
  });

  const [alertAction, setAlertAction] = useState<(() => void) | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    confirmText = "OK",
    onConfirm?: () => void
  ) => {
    setAlertAction(() => onConfirm ?? null);

    setAppAlert({
      visible: true,
      type,
      title,
      message,
      confirmText,
      showCancel: false,
    });
  };

  const closeAlert = () => {
    const action = alertAction;

    setAlertAction(null);

    setAppAlert((prev) => ({
      ...prev,
      visible: false,
    }));

    action?.();
  };

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

  const isRegistering = isLoading || isSubmitting;

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

  const [houseNumber, setHouseNumber] = useState("");

  const [region, setRegion] =
    useState<LocationItem | null>(null);

  const [province, setProvince] =
    useState<LocationItem | null>(null);

  const [municipality, setMunicipality] =
    useState<LocationItem | null>(null);

  const [barangay, setBarangay] =
    useState<LocationItem | null>(null);

  // ====================================================
  // CONTACT INFORMATION
  // ====================================================

  const [mobileNumber, setMobileNumber] = useState("");

  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>("PH");

  const [callingCode, setCallingCode] = useState("63");

  const parsedMobileNumber = useMemo(() => {
    const value = mobileNumber.replace(/[\s()-]/g, "");

    if (!value) {
      return undefined;
    }

    try {
      if (value.startsWith("+")) {
        return parsePhoneNumberFromString(value);
      }

      const country = String(selectedCountry);

      if (!isSupportedCountry(country)) {
        return undefined;
      }

      if (value.startsWith("0")) {
        return parsePhoneNumberFromString(
          `+${callingCode}${value.slice(1)}`
        );
      }

      return parsePhoneNumberFromString(
        value,
        country as PhoneCountryCode
      );
    } catch {
      return undefined;
    }
  }, [mobileNumber, selectedCountry, callingCode]);

  const isMobileNumberValid = Boolean(
    parsedMobileNumber?.isValid()
  );

  // ====================================================
  // PROFILE IMAGE
  // STEP 8
  // ====================================================

  const [profileImage, setProfileImage] =
    useState<ProfileImage | null>(null);

  // ==================================================
  // EDUCATIONAL INFORMATION
  // STEP 4
  // ==================================================

  const [highestEducationalAttainment, setHighestEducationalAttainment] =
    useState("");

  const [educationalStatus, setEducationalStatus] =
    useState("");

  const [schoolName, setSchoolName] =
    useState("");

  const [courseOrDegree, setCourseOrDegree] =
    useState("");

  const [fieldOfStudy, setFieldOfStudy] =
    useState("");

  const [yearGraduated, setYearGraduated] =
    useState("");

  // ==================================================
  // EMPLOYMENT INFORMATION
  // STEP 5
  // ==================================================

  const [employmentStatus, setEmploymentStatus] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [industry, setIndustry] =
    useState("");

  const [yearsOfWorkExperience, setYearsOfWorkExperience] =
    useState("");

  // ==================================================
  // VALID ID INFORMATION
  // STEP 6
  // ==================================================

  const [validIdType, setValidIdType] =
    useState("");

  const [validIdNumber, setValidIdNumber] =
    useState("");

  const [validIdImage, setValidIdImage] =
    useState<ProfileImage | null>(null);

  // ==================================================
  // EMERGENCY CONTACT
  // STEP 7
  // ==================================================

  const [emergencyContactName, setEmergencyContactName] =
    useState("");

  const [emergencyContactNumber, setEmergencyContactNumber] =
    useState("");

  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");

  const [emergencySelectedCountry, setEmergencySelectedCountry] =
    useState<CountryCode>("PH");

  const [emergencyCallingCode, setEmergencyCallingCode] =
    useState("63");

  const parsedEmergencyContactNumber = useMemo(() => {
    const value = emergencyContactNumber.replace(/[\s()-]/g, "");

    if (!value) {
      return undefined;
    }

    try {
      if (value.startsWith("+")) {
        return parsePhoneNumberFromString(value);
      }

      const country = String(emergencySelectedCountry);

      if (!isSupportedCountry(country)) {
        return undefined;
      }

      if (value.startsWith("0")) {
        return parsePhoneNumberFromString(
          `+${emergencyCallingCode}${value.slice(1)}`
        );
      }

      return parsePhoneNumberFromString(
        value,
        country as PhoneCountryCode
      );
    } catch {
      return undefined;
    }
  }, [
    emergencyContactNumber,
    emergencySelectedCountry,
    emergencyCallingCode,
  ]);

  const isEmergencyContactNumberValid = Boolean(
    parsedEmergencyContactNumber?.isValid()
  );

  // ====================================================
  // GOOGLE ID TOKEN
  // ====================================================

  const [googleIdToken, setGoogleIdToken] =
    useState<string | null>(null);

  // ====================================================
  // LOCATION DATA
  // ====================================================

  const [regions, setRegions] =
    useState<LocationItem[]>([]);

  const [provinces, setProvinces] =
    useState<LocationItem[]>([]);

  const [independentCities, setIndependentCities] =
    useState<LocationItem[]>([]);

  const [municipalities, setMunicipalities] =
    useState<LocationItem[]>([]);

  const [barangays, setBarangays] =
    useState<LocationItem[]>([]);

  const [isLoadingRegions, setIsLoadingRegions] =
    useState(false);

  const [isLoadingProvinces, setIsLoadingProvinces] =
    useState(false);

  const [isLoadingIndependentCities, setIsLoadingIndependentCities] =
    useState(false);

  const [isLoadingMunicipalities, setIsLoadingMunicipalities] =
    useState(false);

  const [isLoadingBarangays, setIsLoadingBarangays] =
    useState(false);

  // ====================================================
  // DROPDOWNS / MODALS
  // ====================================================

  const [activeDropdown, setActiveDropdown] =
    useState<
      | "region"
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

    setFirstName(googleFirstName.trim());
    setLastName(googleLastName.trim());
    setEmail(googleEmail.trim().toLowerCase());

    if (googleProfileImageUrl) {
      setProfileImage({
        uri: googleProfileImageUrl,
        name: "google-profile.jpg",
        type: "image/jpeg",
      });
    }

    const loadGoogleToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(
          GOOGLE_REGISTRATION_TOKEN_KEY
        );

        if (!token) {
          setLocalError(
            "Your Google registration session has expired. Please continue with Google again."
          );
          return;
        }

        setGoogleIdToken(token);
      } catch (error) {
        console.error("GOOGLE TOKEN LOAD ERROR:", error);
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

  const sortLocations = (
    items: LocationItem[]
  ): LocationItem[] => {
    return [...items].sort((a, b) => {
      return a.name.localeCompare(b.name, "en", {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  async function fetchLocationList(
    path: string
  ): Promise<LocationItem[]> {
    const response = await fetch(`${PSGC_API}${path}`);

    if (!response.ok) {
      throw new Error(
        `Failed to load locations (${response.status}).`
      );
    }

    const payload: unknown = await response.json();
    let items: unknown;

    if (Array.isArray(payload)) {
      items = payload;
    } else if (
      payload !== null &&
      typeof payload === "object" &&
      "data" in payload
    ) {
      items = (payload as { data: unknown }).data;
    } else {
      throw new Error(
        "The location API returned an unexpected response format."
      );
    }

    if (!Array.isArray(items)) {
      throw new Error(
        "The location API did not return a valid list."
      );
    }

    const validLocations: LocationItem[] = items.filter(
      (item): item is LocationItem =>
        item !== null &&
        typeof item === "object" &&
        "code" in item &&
        typeof item.code === "string" &&
        "name" in item &&
        typeof item.name === "string"
    );

    return sortLocations(validLocations);
  }

  // ==================================================
  // LOAD REGIONS
  // ==================================================

  useEffect(() => {
    let isMounted = true;

    const loadRegions = async () => {
      try {
        setIsLoadingRegions(true);
        const data = await fetchLocationList("/regions");

        if (isMounted) {
          setRegions(data);
        }
      } catch (error) {
        console.error("LOAD REGIONS ERROR:", error);
        if (isMounted) {
          setLocalError(
            "Unable to load regions. Please check your internet connection and try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRegions(false);
        }
      }
    };

    loadRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegionSelect = async (
    item: LocationItem
  ) => {
    setRegion(item);
    setProvince(null);
    setMunicipality(null);
    setBarangay(null);

    setProvinces([]);
    setIndependentCities([]);
    setMunicipalities([]);
    setBarangays([]);

    setLocalError("");
    setActiveDropdown(null);

    const regionPath = `/regions/${encodeURIComponent(item.code)}`;

    try {
      setIsLoadingProvinces(true);
      setIsLoadingIndependentCities(true);

      const [provinceData, cityData] = await Promise.all([
        fetchLocationList(`${regionPath}/provinces`),
        fetchLocationList(`${regionPath}/cities-municipalities`),
      ]);

      const citiesWithoutProvince = cityData.filter((city) => {
        const provinceValue = city.province;

        return (
          provinceValue == null ||
          (typeof provinceValue === "string" &&
            provinceValue.trim() === "")
        );
      });

      setProvinces(provinceData);

      if (provinceData.length === 0) {
        setIndependentCities(cityData);
      } else {
        setIndependentCities(citiesWithoutProvince);
      }
    } catch (error) {
      console.error("LOAD REGION CHILDREN ERROR:", error);
      setLocalError(
        "Unable to load provinces and cities for the selected region. Please try again."
      );
    } finally {
      setIsLoadingProvinces(false);
      setIsLoadingIndependentCities(false);
    }
  };

  // ==================================================
  // SELECT PROVINCE
  // ==================================================

  const handleProvinceSelect = async (
    item: LocationItem
  ) => {
    setProvince(item);
    setMunicipality(null);
    setBarangay(null);

    setMunicipalities([]);
    setBarangays([]);

    setLocalError("");
    setActiveDropdown(null);

    try {
      setIsLoadingMunicipalities(true);
      const data = await fetchLocationList(
        `/provinces/${encodeURIComponent(item.code)}/cities-municipalities`
      );

      setMunicipalities(data);
    } catch (error) {
      console.error("LOAD CITIES ERROR:", error);
      setLocalError(
        "Unable to load cities and municipalities for the selected province. Please try again."
      );
    } finally {
      setIsLoadingMunicipalities(false);
    }
  };

  const handleMunicipalitySelect = async (
    item: LocationItem
  ) => {
    setMunicipality(item);
    setBarangay(null);
    setBarangays([]);

    setLocalError("");
    setActiveDropdown(null);

    try {
      setIsLoadingBarangays(true);
      const data = await fetchLocationList(
        `/cities-municipalities/${encodeURIComponent(item.code)}/barangays`
      );

      setBarangays(data);
    } catch (error) {
      console.error("LOAD BARANGAYS ERROR:", error);
      setLocalError(
        "Unable to load barangays. Please try again."
      );
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  // ==================================================
  // SELECT BARANGAY
  // ==================================================

  const handleBarangaySelect = (
    item: LocationItem
  ) => {
    setBarangay(item);
    setActiveDropdown(null);
  };

  const formattedAddress = useMemo(() => {
    const parts = [
      houseNumber.trim(),
      barangay
        ? getBarangayDisplayName(barangay, municipality?.code)
        : "",
      municipality?.name,
      province?.name,
      region?.name,
    ].filter(Boolean);

    return parts.join(", ");
  }, [
    houseNumber,
    barangay,
    municipality?.code,
    municipality?.name,
    province?.name,
    region?.name,
  ]);

  // ==================================================
  // VALID ID IMAGE PICKER / CAMERA
  // ==================================================

  const handlePickValidIdImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showAlert(
          "Permission Required",
          "Please allow photo library access to upload your valid ID.",
          "warning"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      setValidIdImage({
        uri: asset.uri,
        name: asset.fileName ?? `valid-id-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });

      setLocalError("");
    } catch (error) {
      console.error("VALID ID IMAGE ERROR:", error);
      showAlert(
        "Image Error",
        "Unable to select your valid ID image. Please try again.",
        "error"
      );
    }
  };

  const handleCaptureValidIdImage = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showAlert(
          "Permission Required",
          "Please allow camera access to take a photo of your valid ID.",
          "warning"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      setValidIdImage({
        uri: asset.uri,
        name: asset.fileName ?? `valid-id-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });

      setLocalError("");
    } catch (error) {
      console.error("CAMERA VALID ID ERROR:", error);
      showAlert(
        "Camera Error",
        "Unable to take a photo of your valid ID. Please try again.",
        "error"
      );
    }
  };

  const handlePickProfileImage = async () => {
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
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName ?? `profile-${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";

      setProfileImage({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      });
    } catch (error) {
      console.error("PROFILE IMAGE ERROR:", error);
      Alert.alert(
        "Image Error",
        "Unable to select your profile picture."
      );
    }
  };

  const handleCaptureProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          cameraType: ImagePicker.CameraType.front,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      setProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
    } catch (error) {
      console.error("CAMERA PROFILE IMAGE ERROR:", error);
      Alert.alert(
        "Camera Error",
        "Unable to take your profile picture. Please try again."
      );
    }
  };

  const handleBirthDateChange = (
    _event: unknown,
    selectedDate?: Date
  ) => {
    if (!selectedDate) {
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    setBirthDate(`${year}-${month}-${day}`);
    setShowDatePicker(false);
  };

  const parsedBirthDate = useMemo(() => {
    if (!birthDate) {
      return new Date(
        new Date().getFullYear() - 18,
        0,
        1
      );
    }

    const date = new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return new Date(
        new Date().getFullYear() - 18,
        0,
        1
      );
    }

    return date;
  }, [birthDate]);

  const formattedBirthDate = useMemo(() => {
    if (!birthDate) {
      return "";
    }

    const date = new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return birthDate;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [birthDate]);

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Starts with a capital letter or number",
      valid: /^[A-Z0-9]/.test(password),
    },
    {
      label: "Contains at least one number",
      valid: /\d/.test(password),
    },
    {
      label: "Contains at least one special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const isPasswordStrong =
    passwordRequirements.every(
      (requirement) => requirement.valid
    );

  const doPasswordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const validateStepOne = () => {
    setLocalError("");

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      return false;
    }

    if (!password) {
      setLocalError("Please enter a password.");
      return false;
    }

    if (!isPasswordStrong) {
      setLocalError(
        "Please meet all password requirements before continuing."
      );
      return false;
    }

    if (!confirmPassword) {
      setLocalError("Please confirm your password.");
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return false;
    }

    if (isGoogleRegistration && !googleIdToken) {
      setLocalError(
        "Your Google registration session has expired. Please continue with Google again."
      );
      return false;
    }

    return true;
  };

  const validateStepTwo = () => {
    setLocalError("");

    if (!firstName.trim()) {
      setLocalError("Please enter your first name.");
      return false;
    }

    if (!lastName.trim()) {
      setLocalError("Please enter your last name.");
      return false;
    }

    if (!birthDate) {
      setLocalError("Please select your birth date.");
      return false;
    }

    if (!gender) {
      setLocalError("Please select your gender.");
      return false;
    }

    return true;
  };

  const validateStepThree = () => {
    setLocalError("");

    if (!houseNumber.trim()) {
      setLocalError("Please enter your house number or street.");
      return false;
    }

    if (!region) {
      setLocalError("Please select your region.");
      return false;
    }

    if (!municipality) {
      setLocalError("Please select your city or municipality.");
      return false;
    }

    if (!barangay) {
      setLocalError("Please select your barangay.");
      return false;
    }

    if (!mobileNumber.trim()) {
      setLocalError("Please enter your mobile number.");
      return false;
    }

    if (!isMobileNumberValid || !parsedMobileNumber) {
      setLocalError(
        "Please enter a valid mobile number for the selected country."
      );
      return false;
    }

    return true;
  };

  const validateStepFour = () => {
    setLocalError("");
    return true;
  };

  const handleNext = () => {
    setLocalError("");

    if (isRegistering) return;

    if (step === 1 && !validateStepOne()) return;
    if (step === 2 && !validateStepTwo()) return;
    if (step === 3 && !validateStepThree()) return;

    if (step < 8) {
      setStep((current) => (current + 1) as Step);
    }
  };

  const handleBack = () => {
    setLocalError("");

    if (isRegistering) return;

    if (step === 1) {
      router.replace({
        pathname: "/",
        params: { slide: "3" },
      });
      return;
    }

    setStep((current) => (current - 1) as Step);
  };

  const handleRegister = async () => {
    if (isRegistering) return;
    if (step !== 8) return;
    if (!validateStepFour()) return;

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const values: RegisterFormValues = {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        address: formattedAddress,
        birthDate,
        gender,
        email: normalizedEmail,
        mobileNumber: parsedMobileNumber?.number ?? "",
        password,
        googleIdToken: isGoogleRegistration
          ? googleIdToken ?? undefined
          : undefined,
        profileImage: profileImage ?? undefined,
        highestEducationalAttainment:
          highestEducationalAttainment.trim() || null,
        educationalStatus:
          educationalStatus.trim() || null,
        schoolName:
          schoolName.trim() || null,
        courseOrDegree:
          courseOrDegree.trim() || null,
        fieldOfStudy:
          fieldOfStudy.trim() || null,
        yearGraduated:
          yearGraduated.trim() &&
          Number(yearGraduated) >= 1900 &&
          Number(yearGraduated) <= new Date().getFullYear()
            ? Number(yearGraduated)
            : null,
        employmentStatus:
          employmentStatus.trim() || null,
        companyName:
          companyName.trim() || null,
        jobTitle:
          jobTitle.trim() || null,
        industry:
          industry.trim() || null,
        yearsOfWorkExperience:
          yearsOfWorkExperience.trim()
            ? Number(yearsOfWorkExperience)
            : null,
        validIdType:
          validIdType.trim() || null,
        validIdNumber:
          validIdNumber.trim() || null,
        validIdImage:
          validIdImage ?? undefined,
        emergencyContactName:
          emergencyContactName.trim() || null,
        emergencyContactNumber:
          emergencyContactNumber.trim() || null,
        emergencyContactRelationship:
          emergencyContactRelationship.trim() || null,
      };

      const response = await register(values);

      if (!response) {
        showAlert(
          "Registration Failed",
          "Unable to create your account. Please check your information and try again.",
          "error"
        );
        return;
      }

      let otpSent = false;

      try {
        const otpResponse = await authApi.sendOtp({
          email: normalizedEmail,
        });
        otpSent = Boolean(otpResponse);
      } catch (otpError) {
        console.error("SEND OTP ERROR:", otpError);
      }

      if (isGoogleRegistration) {
        try {
          await SecureStore.deleteItemAsync(
            GOOGLE_REGISTRATION_TOKEN_KEY
          );
        } catch (tokenError) {
          console.error("GOOGLE TOKEN CLEANUP ERROR:", tokenError);
        }
      }

      if (!otpSent) {
        showAlert(
          "Account Created",
          "Your account was created, but we could not send the verification code. Please use the resend verification option or contact support.",
          "warning"
        );
        return;
      }

      showAlert(
        "Registration Successful",
        "Your account has been created. A verification code has been sent to your email.",
        "success",
        "Continue",
        () => {
          router.push({
            pathname: "/(auth)/otp-verification",
            params: {
              email: normalizedEmail,
            },
          });
        }
      );
    } catch (registerError) {
      console.error("REGISTER ERROR:", registerError);
      showAlert(
        "Registration Failed",
        registerError instanceof Error
          ? registerError.message
          : "Unable to create your account. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationItems = useMemo(() => {
    if (activeDropdown === "region") {
      return regions;
    }
    if (activeDropdown === "province") {
      return provinces;
    }
    if (activeDropdown === "municipality") {
      return province ? municipalities : independentCities;
    }
    if (activeDropdown === "barangay") {
      return barangays;
    }
    return [];
  }, [
    activeDropdown,
    regions,
    provinces,
    independentCities,
    municipalities,
    barangays,
    province,
  ]);

  const activeOptionTitle =
    activeOptionDropdown === "educationalStatus"
      ? "Select Educational Status"
      : activeOptionDropdown === "employmentStatus"
        ? "Select Employment Status"
        : "Select Valid ID Type";

  const activeOptionItems =
    activeOptionDropdown === "educationalStatus"
      ? educationalStatusOptions
      : activeOptionDropdown === "employmentStatus"
        ? employmentStatusOptions
        : validIdTypeOptions;

  const handleOptionSelect = (option: string) => {
    if (activeOptionDropdown === "educationalStatus") {
      setEducationalStatus(option);
    } else if (activeOptionDropdown === "employmentStatus") {
      setEmploymentStatus(option);
    } else if (activeOptionDropdown === "validIdType") {
      setValidIdType(option);
    }

    setActiveOptionDropdown(null);
    setLocalError("");
  };

  const locationTitle =
    activeDropdown === "region"
      ? "Select Region"
      : activeDropdown === "province"
        ? "Select Province"
        : activeDropdown === "municipality"
          ? "Select City / Municipality"
          : "Select Barangay";

  const handleLocationItemPress = (
    item: LocationItem
  ) => {
    if (activeDropdown === "region") {
      void handleRegionSelect(item);
      return;
    }

    if (activeDropdown === "province") {
      void handleProvinceSelect(item);
      return;
    }

    if (activeDropdown === "municipality") {
      void handleMunicipalitySelect(item);
      return;
    }

    if (activeDropdown === "barangay") {
      handleBarangaySelect(item);
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <AppAlert
          visible={appAlert.visible}
          type={appAlert.type}
          title={appAlert.title}
          message={appAlert.message}
          confirmText={appAlert.confirmText}
          onConfirm={closeAlert}
          showCancel={false}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Pressable
                onPress={handleBack}
                disabled={isRegistering}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
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

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>
              Create your account
            </Text>

            <Text style={styles.welcomeSubtitle}>
              {stepDescriptions[step]}
            </Text>

            <View style={styles.stepIndicator}>
              {Array.from({ length: 8 }, (_, index) => index + 1).map(
                (item, index) => {
                  const isActive = item === step;
                  const isCompleted = item < step;

                  return (
                    <React.Fragment key={item}>
                      <View
                        style={[
                          styles.stepCircle,
                          isActive && styles.stepCircleActive,
                          isCompleted && styles.stepCircleCompleted,
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
                              isActive && styles.stepNumberActive,
                            ]}
                          >
                            {item}
                          </Text>
                        )}
                      </View>

                      {index < 7 && (
                        <View
                          style={[
                            styles.stepLine,
                            item < step && styles.stepLineActive,
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </View>

            <Text style={styles.stepTitle}>
              {stepTitles[step]}
            </Text>

            {isGoogleRegistration && step === 1 && (
              <View style={styles.googleInfoBox}>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#002B5C"
                />
                <View style={styles.googleInfoContent}>
                  <Text style={styles.googleInfoTitle}>
                    Google account detected
                  </Text>
                  <Text style={styles.googleInfoText}>
                    Your Google email, name, and profile picture have been filled in automatically. Please complete the remaining information.
                  </Text>
                </View>
              </View>
            )}

            {step === 1 && (
              <>
                <Input
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading && !isGoogleRegistration}
                />

                <Input
                  label="Password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightElement={
                    <Pressable
                      onPress={() =>
                        setShowPassword((value) => !value)
                      }
                      disabled={isLoading}
                      hitSlop={10}
                      style={styles.eyeButton}
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightElement={
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      disabled={isLoading}
                      hitSlop={10}
                      style={styles.eyeButton}
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

                <View style={styles.passwordRules}>
                  <Text style={styles.passwordRulesTitle}>
                    Password requirements
                  </Text>
                  <Text style={styles.passwordRulesSubtitle}>
                    Create a strong password to secure your account.
                  </Text>

                  {passwordRequirements.map((requirement) => (
                    <View
                      key={requirement.label}
                      style={styles.ruleRow}
                    >
                      <Ionicons
                        name={
                          requirement.valid
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={18}
                        color={
                          requirement.valid ? "#16A34A" : "#94A3B8"
                        }
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          requirement.valid && styles.ruleTextValid,
                        ]}
                      >
                        {requirement.label}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.passwordRulesDivider} />

                  <View style={styles.ruleRow}>
                    <Ionicons
                      name={
                        doPasswordsMatch
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={18}
                      color={
                        doPasswordsMatch ? "#16A34A" : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.ruleText,
                        doPasswordsMatch && styles.ruleTextValid,
                      ]}
                    >
                      Passwords match
                    </Text>
                  </View>

                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthTrack}>
                        {passwordRequirements.map((requirement) => (
                          <View
                            key={requirement.label}
                            style={[
                              styles.passwordStrengthSegment,
                              requirement.valid &&
                                styles.passwordStrengthSegmentActive,
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.passwordStrengthText,
                          isPasswordStrong &&
                            styles.passwordStrengthTextStrong,
                        ]}
                      >
                        {isPasswordStrong
                          ? "Strong password"
                          : "Password requirements not yet met"}
                      </Text>
                    </View>
                  )}
                </View>

                {isGoogleRegistration && (
                  <View style={styles.googleEmailNote}>
                    <Ionicons
                      name="logo-google"
                      size={16}
                      color="#002B5C"
                    />
                    <Text style={styles.googleEmailNoteText}>
                      This email is linked to your Google account.
                    </Text>
                  </View>
                )}

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Your email and password will be used to access your participant account.
                  </Text>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Input
                      label="First Name"
                      icon="person-outline"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="First name"
                      autoCapitalize="words"
                      editable={!isLoading && !isGoogleRegistration}
                    />
                  </View>

                  <View style={styles.nameField}>
                    <Input
                      label="Last Name"
                      icon="person-outline"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last name"
                      autoCapitalize="words"
                      editable={!isLoading && !isGoogleRegistration}
                    />
                  </View>
                </View>

                <Input
                  label="Middle Name"
                  icon="person-outline"
                  value={middleName}
                  onChangeText={setMiddleName}
                  placeholder="Middle name (optional)"
                  autoCapitalize="words"
                  editable={!isLoading}
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Gender</Text>
                  <Pressable
                    onPress={() => setShowGenderDropdown(true)}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.inputWrapper,
                      gender && styles.inputWrapperActive,
                      pressed && styles.dropdownPressed,
                    ]}
                  >
                    <Ionicons
                      name="male-female-outline"
                      size={20}
                      color="#002B5C"
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        !gender && styles.dropdownPlaceholder,
                      ]}
                    >
                      {gender || "Select gender"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={19}
                      color="#64748B"
                    />
                  </Pressable>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Birth Date</Text>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.inputWrapper,
                      birthDate && styles.inputWrapperActive,
                      pressed && styles.dropdownPressed,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#002B5C"
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        !birthDate && styles.dropdownPlaceholder,
                      ]}
                    >
                      {formattedBirthDate || "Select birth date"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={19}
                      color="#64748B"
                    />
                  </Pressable>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Please make sure your personal information matches your valid identification details.
                  </Text>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  label="House Number / Street"
                  icon="home-outline"
                  value={houseNumber}
                  onChangeText={setHouseNumber}
                  placeholder="House number or street"
                  autoCapitalize="words"
                  editable={!isLoading}
                />

                <DropdownButton
                  label="Region"
                  icon="globe-outline"
                  value={region?.name}
                  placeholder="Select region"
                  onPress={() => setActiveDropdown("region")}
                  loading={isLoadingRegions}
                  disabled={isLoading || isLoadingRegions}
                />

                <DropdownButton
                  label="Province (if applicable)"
                  icon="location-outline"
                  value={province?.name}
                  placeholder={
                    !region
                      ? "Select region first"
                      : isLoadingProvinces
                        ? "Loading provinces..."
                        : provinces.length === 0
                          ? "No province available; select city"
                          : "Select province or independent city"
                  }
                  onPress={() => setActiveDropdown("province")}
                  loading={isLoadingProvinces}
                  disabled={
                    isLoading ||
                    !region ||
                    isLoadingProvinces ||
                    provinces.length === 0
                  }
                />

                <DropdownButton
                  label="City / Municipality"
                  icon="business-outline"
                  value={municipality?.name}
                  placeholder={
                    !region
                      ? "Select region first"
                      : province
                        ? "Select city / municipality"
                        : independentCities.length > 0
                          ? "Select city / municipality"
                          : isLoadingIndependentCities
                            ? "Loading cities..."
                            : "No cities available"
                  }
                  onPress={() => setActiveDropdown("municipality")}
                  loading={
                    province
                      ? isLoadingMunicipalities
                      : isLoadingIndependentCities
                  }
                  disabled={
                    isLoading ||
                    !region ||
                    (province
                      ? isLoadingMunicipalities || municipalities.length === 0
                      : isLoadingIndependentCities || independentCities.length === 0)
                  }
                />

                <DropdownButton
                  label="Barangay"
                  icon="map-outline"
                  value={barangay?.name}
                  placeholder={
                    municipality
                      ? "Select barangay"
                      : "Select municipality first"
                  }
                  onPress={() => setActiveDropdown("barangay")}
                  loading={isLoadingBarangays}
                  disabled={
                    isLoading ||
                    !municipality ||
                    isLoadingBarangays
                  }
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      mobileNumber.length > 0 &&
                        (isMobileNumberValid
                          ? styles.inputWrapperActive
                          : { borderColor: "#FCA5A5" }),
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color="#002B5C"
                      style={styles.inputIcon}
                    />
                    <CountryPicker
                      countryCode={selectedCountry}
                      withFilter
                      withFlag
                      withEmoji
                      withCountryNameButton={false}
                      withCallingCodeButton={false}
                      onSelect={(country) => {
                        setSelectedCountry(country.cca2);
                        setCallingCode(country.callingCode[0] ?? "");
                        setMobileNumber("");
                        setLocalError("");
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#334155",
                        marginRight: 10,
                      }}
                    >
                      +{callingCode}
                    </Text>
                    <View
                      style={{
                        width: 1,
                        height: 25,
                        backgroundColor: "#D9E2EC",
                        marginRight: 10,
                      }}
                    />
                    <TextInput
                      value={mobileNumber}
                      onChangeText={(value) => {
                        setMobileNumber(value.replace(/\D/g, ""));
                        setLocalError("");
                      }}
                      placeholder={
                        selectedCountry === "PH"
                          ? "9171234567"
                          : "Enter phone number"
                      }
                      placeholderTextColor="#A0AEC0"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isRegistering}
                      style={styles.input}
                    />
                  </View>

                  {mobileNumber.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 7,
                      }}
                    >
                      <Ionicons
                        name={
                          isMobileNumberValid
                            ? "checkmark-circle"
                            : "alert-circle-outline"
                        }
                        size={15}
                        color={
                          isMobileNumberValid ? "#16A34A" : "#DC2626"
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: isMobileNumberValid
                            ? "#15803D"
                            : "#DC2626",
                        }}
                      >
                        {isMobileNumberValid
                          ? "Valid phone number format"
                          : "Enter a valid number for the selected country."}
                      </Text>
                    </View>
                  )}
                </View>

                {formattedAddress ? (
                  <View style={styles.addressPreview}>
                    <Ionicons
                      name="navigate-outline"
                      size={18}
                      color="#002B5C"
                    />
                    <View style={styles.addressContent}>
                      <Text style={styles.addressLabel}>
                        Address Preview
                      </Text>
                      <Text style={styles.addressText}>
                        {formattedAddress}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Your address will be used for your participant profile and official training records.
                  </Text>
                </View>
              </>
            )}

            {step === 4 && (
              <>
                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Provide your educational background, employment details, valid ID information, and emergency contact. These fields are optional unless your organization requires them.
                  </Text>
                </View>

                <Text style={styles.formSectionTitle}>
                  Educational Information
                </Text>

                <Input
                  label="Highest Educational Attainment"
                  icon="school-outline"
                  value={highestEducationalAttainment}
                  onChangeText={setHighestEducationalAttainment}
                  placeholder="e.g. Bachelor's Degree"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <DropdownButton
                  label="Educational Status"
                  icon="book-outline"
                  value={educationalStatus}
                  placeholder="Select educational status"
                  onPress={() => setActiveOptionDropdown("educationalStatus")}
                  disabled={isRegistering}
                />

                <Input
                  label="School Name"
                  icon="business-outline"
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="Enter school name"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Course or Degree"
                  icon="ribbon-outline"
                  value={courseOrDegree}
                  onChangeText={setCourseOrDegree}
                  placeholder="e.g. BS Information Technology"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Field of Study"
                  icon="library-outline"
                  value={fieldOfStudy}
                  onChangeText={setFieldOfStudy}
                  placeholder="e.g. Information Technology"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Year Graduated"
                  icon="calendar-outline"
                  value={yearGraduated}
                  onChangeText={(value) =>
                    setYearGraduated(value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 2025"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  editable={!isRegistering}
                />
              </>
            )}

            {step === 5 && (
              <>
                <View style={styles.infoBox}>
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Provide your employment details and work experience, if applicable.
                  </Text>
                </View>

                <Text style={styles.formSectionTitle}>
                  Employment Information
                </Text>

                <DropdownButton
                  label="Employment Status"
                  icon="briefcase-outline"
                  value={employmentStatus}
                  placeholder="Select employment status"
                  onPress={() => setActiveOptionDropdown("employmentStatus")}
                  disabled={isRegistering}
                />

                <Input
                  label="Company Name"
                  icon="business-outline"
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter company name"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Job Title"
                  icon="person-outline"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="Enter job title"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Industry"
                  icon="briefcase-outline"
                  value={industry}
                  onChangeText={setIndustry}
                  placeholder="e.g. Education, IT, Business"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <Input
                  label="Years of Work Experience"
                  icon="time-outline"
                  value={yearsOfWorkExperience}
                  onChangeText={(value) =>
                    setYearsOfWorkExperience(value.replace(/\D/g, "").slice(0, 2))
                  }
                  placeholder="e.g. 3"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  editable={!isRegistering}
                />
              </>
            )}

            {step === 6 && (
              <>
                <View style={styles.infoBox}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Provide your valid ID details. You can upload an existing ID image or take a photo using your camera.
                  </Text>
                </View>

                <Text style={styles.formSectionTitle}>
                  Valid ID Information
                </Text>

                <DropdownButton
                  label="Valid ID Type"
                  icon="card-outline"
                  value={validIdType}
                  placeholder="Select valid ID type"
                  onPress={() => setActiveOptionDropdown("validIdType")}
                  disabled={isRegistering}
                />

                <Input
                  label="Valid ID Number"
                  icon="document-text-outline"
                  value={validIdNumber}
                  onChangeText={setValidIdNumber}
                  placeholder="Enter ID number"
                  autoCapitalize="characters"
                  editable={!isRegistering}
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Valid ID Image</Text>
                  <Pressable
                    onPress={handlePickValidIdImage}
                    disabled={isRegistering}
                    style={({ pressed }) => [
                      styles.idImagePicker,
                      pressed && styles.profilePickerPressed,
                      isRegistering && styles.dropdownDisabled,
                    ]}
                  >
                    {validIdImage ? (
                      <Image
                        source={{ uri: validIdImage.uri }}
                        style={styles.idImagePreview}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="cloud-upload-outline"
                        size={30}
                        color="#002B5C"
                      />
                    )}
                    <Text style={styles.idImageText}>
                      {validIdImage
                        ? "Change valid ID image"
                        : "Upload valid ID image (optional)"}
                    </Text>
                  </Pressable>

                  {/* Camera and Upload Action Buttons para sa Valid ID */}
                  <View style={styles.profileActions}>
                    <Pressable
                      onPress={handleCaptureValidIdImage}
                      disabled={isRegistering}
                      style={[
                        styles.profileActionButton,
                        styles.profileActionPrimary,
                      ]}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text style={styles.profileActionPrimaryText}>
                        Take Photo
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handlePickValidIdImage}
                      disabled={isRegistering}
                      style={[
                        styles.profileActionButton,
                        styles.profileActionSecondary,
                      ]}
                    >
                      <Ionicons
                        name="image-outline"
                        size={19}
                        color="#002B5C"
                      />
                      <Text style={styles.profileActionSecondaryText}>
                        Upload Photo
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            {step === 7 && (
              <>
                <View style={styles.infoBox}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Add someone we can contact in an emergency. Make sure you have permission to provide their details.
                  </Text>
                </View>

                <Text style={styles.formSectionTitle}>
                  Emergency Contact
                </Text>

                <Input
                  label="Emergency Contact Name"
                  icon="person-outline"
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  placeholder="Enter contact person's full name"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Emergency Contact Number</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      emergencyContactNumber.length > 0 &&
                        (isEmergencyContactNumberValid
                          ? styles.inputWrapperActive
                          : { borderColor: "#FCA5A5" }),
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color="#002B5C"
                      style={styles.inputIcon}
                    />
                    <CountryPicker
                      countryCode={emergencySelectedCountry}
                      withFilter
                      withFlag
                      withEmoji
                      withCountryNameButton={false}
                      withCallingCodeButton={false}
                      onSelect={(country: Country) => {
                        setEmergencySelectedCountry(country.cca2);
                        setEmergencyCallingCode(country.callingCode[0] ?? "");
                        setEmergencyContactNumber("");
                        setLocalError("");
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#334155",
                        marginRight: 10,
                      }}
                    >
                      +{emergencyCallingCode}
                    </Text>
                    <View
                      style={{
                        width: 1,
                        height: 25,
                        backgroundColor: "#D9E2EC",
                        marginRight: 10,
                      }}
                    />
                    <TextInput
                      value={emergencyContactNumber}
                      onChangeText={(value) => {
                        setEmergencyContactNumber(value.replace(/\D/g, ""));
                        setLocalError("");
                      }}
                      placeholder={
                        emergencySelectedCountry === "PH"
                          ? "9171234567"
                          : "Enter phone number"
                      }
                      placeholderTextColor="#A0AEC0"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isRegistering}
                      style={styles.input}
                    />
                  </View>

                  {emergencyContactNumber.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 7,
                      }}
                    >
                      <Ionicons
                        name={
                          isEmergencyContactNumberValid
                            ? "checkmark-circle"
                            : "alert-circle-outline"
                        }
                        size={15}
                        color={
                          isEmergencyContactNumberValid
                            ? "#16A34A"
                            : "#DC2626"
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: isEmergencyContactNumberValid
                            ? "#15803D"
                            : "#DC2626",
                        }}
                      >
                        {isEmergencyContactNumberValid
                          ? "Valid phone number format"
                          : "Enter a valid number for the selected country."}
                      </Text>
                    </View>
                  )}
                </View>

                <Input
                  label="Relationship to Participant"
                  icon="people-outline"
                  value={emergencyContactRelationship}
                  onChangeText={setEmergencyContactRelationship}
                  placeholder="e.g. Parent, Spouse, Sibling"
                  autoCapitalize="words"
                  editable={!isRegistering}
                />

                <View style={styles.infoBox}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#002B5C"
                  />
                  <Text style={styles.infoText}>
                    Only provide information you are comfortable sharing. Make sure you have permission to provide another person's emergency contact details.
                  </Text>
                </View>
              </>
            )}

            {step === 8 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>
                  Review Your Registration
                </Text>
                <Text style={styles.stepDescription}>
                  Upload your profile picture and review your information before creating your account.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Profile Picture</Text>
                  <Pressable
                    onPress={handlePickProfileImage}
                    disabled={isRegistering}
                    style={({ pressed }) => [
                      styles.profilePicker,
                      pressed && styles.profilePickerPressed,
                      isRegistering && styles.dropdownDisabled,
                    ]}
                  >
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage.uri }}
                        style={styles.profileImagePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.profileIconCircle}>
                        <Ionicons
                          name="person-outline"
                          size={32}
                          color="#002B5C"
                        />
                      </View>
                    )}
                    <Text style={styles.profileTitle}>
                      {profileImage
                        ? "Change Profile Picture"
                        : "Add Profile Picture"}
                    </Text>
                    <Text style={styles.profileSubtitle}>
                      Take a photo or choose one from your gallery
                    </Text>
                  </Pressable>

                  <View style={styles.profileActions}>
                    <Pressable
                      onPress={handleCaptureProfileImage}
                      disabled={isRegistering}
                      style={[
                        styles.profileActionButton,
                        styles.profileActionPrimary,
                      ]}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text style={styles.profileActionPrimaryText}>
                        Take Photo
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handlePickProfileImage}
                      disabled={isRegistering}
                      style={[
                        styles.profileActionButton,
                        styles.profileActionSecondary,
                      ]}
                    >
                      <Ionicons
                        name="image-outline"
                        size={19}
                        color="#002B5C"
                      />
                      <Text style={styles.profileActionSecondaryText}>
                        Upload Photo
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color="#002B5C"
                    />
                    <Text style={styles.summaryTitle}>
                      Registration Summary
                    </Text>
                  </View>

                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>
                      Personal Information
                    </Text>
                    <SummaryRow
                      label="Full Name"
                      value={[
                        firstName,
                        middleName,
                        lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <SummaryRow label="Email" value={email} />
                    <SummaryRow label="Birth Date" value={formattedBirthDate} />
                    <SummaryRow label="Gender" value={gender} />
                    <SummaryRow label="Mobile Number" value={parsedMobileNumber?.number} />
                    <SummaryRow label="Address" value={formattedAddress} />
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>
                      Educational Information
                    </Text>
                    <SummaryRow
                      label="Highest Attainment"
                      value={highestEducationalAttainment}
                    />
                    <SummaryRow
                      label="Educational Status"
                      value={educationalStatus}
                    />
                    <SummaryRow label="School" value={schoolName} />
                    <SummaryRow label="Course / Degree" value={courseOrDegree} />
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>
                      Employment Information
                    </Text>
                    <SummaryRow
                      label="Employment Status"
                      value={employmentStatus}
                    />
                    <SummaryRow label="Company" value={companyName} />
                    <SummaryRow label="Job Title" value={jobTitle} />
                    <SummaryRow label="Industry" value={industry} />
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Valid ID</Text>
                    <SummaryRow label="ID Type" value={validIdType} />
                    <SummaryRow label="ID Number" value={validIdNumber} />
                    <SummaryRow
                      label="ID Image"
                      value={validIdImage ? "Uploaded" : "Not uploaded"}
                    />
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>
                      Emergency Contact
                    </Text>
                    <SummaryRow
                      label="Contact Name"
                      value={emergencyContactName}
                    />
                    <SummaryRow
                      label="Relationship"
                      value={emergencyContactRelationship}
                    />
                    <SummaryRow
                      label="Contact Number"
                      value={emergencyContactNumber}
                    />
                  </View>
                </View>

                <Text style={styles.summaryNotice}>
                  Please review your information before creating your account. You can go back to previous steps to make corrections.
                </Text>
              </View>
            )}

            {displayError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>
                  {displayError}
                </Text>
              </View>
            ) : null}

            <View style={styles.actionArea}>
              {step > 1 && (
                <Pressable
                  onPress={handleBack}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#002B5C"
                  />
                  <Text style={styles.secondaryButtonText}>
                    Back
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={step === 8 ? handleRegister : handleNext}
                disabled={isRegistering}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isRegistering && styles.primaryButtonPressed,
                  isRegistering && styles.primaryButtonDisabled,
                ]}
              >
                {isRegistering ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>
                      Creating account...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.primaryButtonContent}>
                    <Text style={styles.primaryButtonText}>
                      {step === 8 ? "Create Account" : "Continue"}
                    </Text>
                    <Ionicons
                      name={step === 8 ? "checkmark" : "arrow-forward"}
                      size={19}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.loginSection}>
              <View style={styles.loginDivider}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <Text style={styles.loginQuestion}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() => router.replace("/(auth)/login")}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                <Text style={styles.loginButtonText}>
                  Sign in
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#002B5C"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#64748B"
              />
              <Text style={styles.securityText}>
                Secure and protected access
              </Text>
            </View>
            <Text style={styles.footerText}>
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
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.dateModal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Date of Birth</Text>
                <Text style={styles.modalSubtitle}>Select your birth date</Text>
              </View>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={23} color="#64748B" />
              </Pressable>
            </View>
            <DateTimePicker
              value={parsedBirthDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
              onChange={handleBirthDateChange}
            />
            {Platform.OS === "ios" && (
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={styles.modalDoneButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ====================================== */}
      {/* GENDER MODAL */}
      {/* ====================================== */}
      <Modal
        visible={showGenderDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGenderDropdown(false)}
        >
          <Pressable
            style={styles.selectionModal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Gender</Text>
                <Text style={styles.modalSubtitle}>Choose an option</Text>
              </View>
              <Pressable
                onPress={() => setShowGenderDropdown(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={23} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.optionList}>
              {genderOptions.map((option) => {
                const selected = gender === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setGender(option);
                      setShowGenderDropdown(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionItem,
                      selected && styles.optionItemSelected,
                      pressed && styles.optionItemPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        selected && styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          option === "Male"
                            ? "male-outline"
                            : option === "Female"
                              ? "female-outline"
                              : "person-outline"
                        }
                        size={20}
                        color={selected ? "#FFFFFF" : "#002B5C"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color="#002B5C"
                        style={styles.optionCheck}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ====================================== */}
      {/* OPTIONS / STATUS MODAL */}
      {/* ====================================== */}
      <Modal
        visible={activeOptionDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveOptionDropdown(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveOptionDropdown(null)}
        >
          <Pressable
            style={styles.selectionModal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {activeOptionTitle}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an option from the list
                </Text>
              </View>
              <Pressable
                onPress={() => setActiveOptionDropdown(null)}
                hitSlop={10}
              >
                <Ionicons name="close" size={23} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionList}
            >
              {activeOptionItems.map((option) => {
                const selected =
                  (activeOptionDropdown === "educationalStatus" && educationalStatus === option) ||
                  (activeOptionDropdown === "employmentStatus" && employmentStatus === option) ||
                  (activeOptionDropdown === "validIdType" && validIdType === option);

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      handleOptionSelect(option);
                    }}
                    style={({ pressed }) => [
                      styles.optionItem,
                      selected && styles.optionItemSelected,
                      pressed && styles.optionItemPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        selected && styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          activeOptionDropdown === "validIdType"
                            ? "card-outline"
                            : activeOptionDropdown === "employmentStatus"
                              ? "briefcase-outline"
                              : "book-outline"
                        }
                        size={20}
                        color={selected ? "#FFFFFF" : "#002B5C"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color="#002B5C"
                        style={styles.optionCheck}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ====================================== */}
      {/* LOCATION MODAL */}
      {/* ====================================== */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.locationModalOverlay}>
          <Pressable
            style={styles.locationBackdrop}
            onPress={() => setActiveDropdown(null)}
          />

          <View style={styles.locationModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {locationTitle}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Select from the list below
                </Text>
              </View>

              <Pressable
                onPress={() => setActiveDropdown(null)}
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
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.locationList}
            >
              {locationItems.length === 0 ? (
                <View style={styles.emptyLocation}>
                  <Ionicons
                    name="location-outline"
                    size={30}
                    color="#94A3B8"
                  />
                  <Text style={styles.emptyLocationText}>
                    No locations available.
                  </Text>
                </View>
              ) : (
                locationItems.map((item) => (
                  <Pressable
                    key={item.code}
                    onPress={() =>
                      handleLocationItemPress(item)
                    }
                    style={({ pressed }) => [
                      styles.locationItem,
                      pressed && styles.locationItemPressed,
                    ]}
                  >
                    <View style={styles.locationIcon}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#002B5C"
                      />
                    </View>
                    <Text style={styles.locationItemText}>
                      {activeDropdown === "barangay"
                        ? getBarangayDisplayName(item, municipality?.code)
                        : item.name.trim()}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color="#CBD5E1"
                    />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const stepTitles: Record<Step, string> = {
  1: "Account Information",
  2: "Personal Information",
  3: "Address and Contact Information",
  4: "Educational Background",
  5: "Employment Information",
  6: "Valid ID Verification",
  7: "Emergency Contact",
  8: "Profile Picture and Review",
};

const stepDescriptions: Record<Step, string> = {
  1: "Create your account credentials.",
  2: "Enter your personal information.",
  3: "Enter your complete address and mobile number.",
  4: "Provide your educational background.",
  5: "Tell us about your employment and work experience.",
  6: "Provide your valid ID details and image.",
  7: "Add a person we can contact in an emergency.",
  8: "Review your details and complete your registration.",
};

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
    transform: [{ scale: 0.95 }],
  },
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
  googleInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#F4F7FB",
    borderWidth: 1,
    borderColor: "#D4E0ED",
  },
  googleInfoContent: {
    flex: 1,
    marginLeft: 9,
  },
  googleInfoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#002B5C",
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
    backgroundColor: "#EAF1F8",
  },
  googleEmailNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    color: "#475569",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 11,
  },
  stepCircle: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  stepCircleActive: {
    borderColor: "#002B5C",
    backgroundColor: "#002B5C",
  },
  stepCircleCompleted: {
    borderColor: "#002B5C",
    backgroundColor: "#002B5C",
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    flex: 1,
    minWidth: 3,
    height: 1,
    marginHorizontal: 3,
    backgroundColor: "#E2E8F0",
  },
  stepLineActive: {
    backgroundColor: "#002B5C",
  },
  stepTitle: {
    marginBottom: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
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
    borderColor: "#7FA1C4",
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
  profilePicker: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B8CBE0",
    borderRadius: 14,
    backgroundColor: "#F4F7FB",
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
    backgroundColor: "#EAF1F8",
  },
  profileTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#002B5C",
  },
  profileSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#94A3B8",
  },
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#F4F7FB",
    borderWidth: 1,
    borderColor: "#D4E0ED",
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
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  passwordRulesSubtitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ruleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    color: "#64748B",
  },
  ruleTextValid: {
    color: "#15803D",
    fontWeight: "600",
  },
  passwordRulesDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#E2E8F0",
  },
  passwordStrengthContainer: {
    marginTop: 14,
  },
  passwordStrengthTrack: {
    flexDirection: "row",
    gap: 5,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  passwordStrengthSegmentActive: {
    backgroundColor: "#16A34A",
  },
  passwordStrengthText: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  passwordStrengthTextStrong: {
    color: "#15803D",
  },
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
    backgroundColor: "#002B5C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#002B5C",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
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
    transform: [{ scale: 0.985 }],
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
    borderColor: "#B8CBE0",
    backgroundColor: "#F4F7FB",
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#002B5C",
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
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
    borderColor: "#B8CBE0",
    backgroundColor: "#F4F7FB",
  },
  loginButtonPressed: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#002B5C",
  },
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
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
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
  modalDoneButton: {
    height: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#002B5C",
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
    borderColor: "#B8CBE0",
    backgroundColor: "#F4F7FB",
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
    backgroundColor: "#EAF1F8",
  },
  optionIconSelected: {
    backgroundColor: "#002B5C",
  },
  optionText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  optionTextSelected: {
    color: "#002B5C",
    fontWeight: "800",
  },
  optionCheck: {
    marginLeft: 8,
  },
  locationModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  locationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
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
    backgroundColor: "#EAF1F8",
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
  profileActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  profileActionButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  profileActionPrimary: {
    backgroundColor: "#002B5C",
  },
  profileActionSecondary: {
    backgroundColor: "#EAF1F8",
    borderWidth: 1,
    borderColor: "#B8CBE0",
  },
  profileActionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  profileActionSecondaryText: {
    color: "#002B5C",
    fontSize: 14,
    fontWeight: "600",
  },
  formSectionTitle: {
    marginTop: 28,
    marginBottom: 2,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    fontSize: 15,
    fontWeight: "800",
    color: "#002B5C",
  },
  idImagePicker: {
    minHeight: 125,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B8CBE0",
    borderRadius: 12,
    backgroundColor: "#F4F7FB",
  },
  idImagePreview: {
    width: "100%",
    height: 150,
  },
  idImageText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#002B5C",
    textAlign: "center",
  },
  stepContainer: {
    width: "100%",
    gap: 16,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    gap: 16,
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
  summarySection: {
    gap: 12,
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#002B5C",
    marginBottom: 2,
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
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  summaryNotice: {
    fontSize: 12,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 8,
  },
  profileImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#002b5c",
    backgroundColor: "#f3f4f6",
  },
});