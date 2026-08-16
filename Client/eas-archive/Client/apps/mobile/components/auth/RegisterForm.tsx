import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { SafeAreaView } from "react-native-safe-area-context";

import AccountStep, {
  AccountSetup,
} from "./register/AccountStep";

import OTPVerification from "./register/OTPVerification";

import PersonalInformation, {
  PersonalInformationData,
} from "./register/PersonalInformationStep";

import EmergencyContactStep, {
  EmergencyContactData,
} from "./register/EmergencyContactStep";

import ProfilePhotoPicker from "./register/ProfilePhotoPicker";
import ValidIdPicker, {
  ValidIdFile,
} from "./register/ValidIdPicker";
import { authApi, participantApi } from "@/api/api";
import { router } from "expo-router";

// =====================================================
// REGISTER STEP
// =====================================================

type RegisterStep =
  | "account"
  | "otp"
  | "personal"
  | "emergency"
  | "photo";

export default function RegisterForm() {
  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [step, setStep] =
    useState<RegisterStep>("account");

  // =====================================================
  // ACCOUNT DATA
  // =====================================================

  const [form, setForm] =
    useState<AccountSetup>({
      Username: "",
      Email: "",
      Password: "",
      ConfirmPassword: "",
    });

  // =====================================================
  // PERSONAL INFORMATION
  // STEP 1
  // =====================================================

  const [personalData, setPersonalData] =
    useState<PersonalInformationData | null>(
      null
    );

  // =====================================================
  // EMERGENCY CONTACT
  // STEP 2
  // =====================================================

  const [emergencyData, setEmergencyData] =
    useState<EmergencyContactData | null>(
      null
    );

  // =====================================================
  // PROFILE PHOTO
  // STEP 3
  // =====================================================

  const [profileImage, setProfileImage] =
    useState<string>("");
const [validId, setValidId] =
  useState<ValidIdFile | null>(null);
  // =====================================================
  // UPDATE ACCOUNT FORM
  // =====================================================

  
  const updateForm = (
    values: Partial<AccountSetup>
  ) => {
    setForm((current) => ({
      ...current,
      ...values,
    }));
  };

  // =====================================================
  // ACCOUNT
  // ACCOUNT → REGISTER → SEND OTP
  // =====================================================

  const handleContinue = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const username =
        form.Username.trim();

      const email =
        form.Email.trim().toLowerCase();

      console.log(
        "================================"
      );

      console.log(
        "REGISTER ACCOUNT"
      );

      console.log({
        Username: username,
        Email: email,
      });

      // =================================================
      // 1. CREATE ACCOUNT
      // =================================================

      const registerResponse =
        await authApi.register({
          username,
          email,
          password: form.Password,
          role: "Participant"
        });

      console.log(
        "REGISTER RESPONSE:",
        registerResponse
      );

      // =================================================
      // 2. SEND OTP
      // =================================================

      const otpResponse =
        await authApi.sendotp({
          email,
        });

      console.log(
        "OTP RESPONSE:",
        otpResponse
      );

      // =================================================
      // 3. GO TO OTP SCREEN
      // =================================================

      console.log(
        "GOING TO OTP SCREEN"
      );

      setStep("otp");

    } catch (error: any) {
      console.error(
        "REGISTER ACCOUNT ERROR:",
        error
      );

      Alert.alert(
        "Registration Failed",
        error?.message ||
          "Unable to create your account."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OTP VERIFIED
  // OTP → PERSONAL INFORMATION
  // =====================================================

  const handleOtpVerified = () => {
    console.log(
      "================================"
    );

    console.log(
      "EMAIL VERIFIED:",
      form.Email
    );

    setStep("personal");
  };

  // =====================================================
  // PERSONAL INFORMATION COMPLETE
  // STEP 1 → STEP 2
  // =====================================================

  const handlePersonalComplete = (
    data: PersonalInformationData
  ) => {
    console.log(
      "================================"
    );

    console.log(
      "PERSONAL INFORMATION COMPLETE"
    );

    console.log(data);

    // Save personal information
    setPersonalData(data);

    // Go to Step 2
    setStep("emergency");
  };

  // =====================================================
  // EMERGENCY CONTACT COMPLETE
  // STEP 2 → STEP 3
  // =====================================================

  const handleEmergencyComplete = (
    data: EmergencyContactData
  ) => {
    console.log(
      "================================"
    );

    console.log(
      "EMERGENCY CONTACT COMPLETE"
    );

    console.log(data);

    // Save emergency contact
    setEmergencyData(data);

    // Go to Step 3
    setStep("photo");
  };

  // =====================================================
  // PROFILE PHOTO CHANGE
  // =====================================================

  const handleProfilePhotoChange = (
    uri: string
  ) => {
    console.log(
      "================================"
    );

    console.log(
      "PROFILE PHOTO SELECTED:"
    );

    console.log(uri);

    setProfileImage(uri);
  };

  const handleValidIdChange = (
  file: ValidIdFile | null
) => {
  console.log(
    "================================"
  );

  console.log(
    "VALID ID SELECTED:"
  );

  console.log(file);

  setValidId(file);
};

  // =====================================================
  // BACK FROM EMERGENCY
  // STEP 2 → STEP 1
  // =====================================================

  const handleBackToPersonal = () => {
    setStep("personal");
  };

  // =====================================================
  // BACK FROM PHOTO
  // STEP 3 → STEP 2
  // =====================================================

  const handleBackToEmergency = () => {
    setStep("emergency");
  };

  // =====================================================
  // COMPLETE REGISTRATION
  // STEP 3 → API
  // =====================================================

  const handleCompleteRegistration =
    async () => {
      if (loading) return;

      // =================================================
      // VALIDATE PERSONAL DATA
      // =================================================

      if (!personalData) {
        Alert.alert(
          "Registration Error",
          "Personal information is missing."
        );

        setStep("personal");

        return;
      }

      // =================================================
      // VALIDATE EMERGENCY DATA
      // =================================================

      if (!emergencyData) {
        Alert.alert(
          "Registration Error",
          "Emergency contact information is missing."
        );

        setStep("emergency");

        return;
      }

      // =================================================
      // VALIDATE PROFILE PHOTO
      // =================================================

      if (!profileImage) {
        Alert.alert(
          "Profile Photo Required",
          "Please take your profile photo before completing registration."
        );

        return;
      }

      if (!validId) {
  Alert.alert(
    "Valid ID Required",
    "Please select an accepted ID and capture a clear photo of it."
  );

  return;
}

      try {
        setLoading(true);

        const email =
          form.Email.trim().toLowerCase();

        console.log(
          "================================"
        );

        console.log(
          "FINAL PARTICIPANT REGISTRATION"
        );

        console.log(
          "EMAIL:",
          email
        );

        console.log(
          "PERSONAL DATA:",
          personalData
        );

        console.log(
          "EMERGENCY DATA:",
          emergencyData
        );

        console.log(
          "PROFILE IMAGE:",
          profileImage
        );

        // =================================================
        // CREATE PARTICIPANT PROFILE
        // =================================================

        const response =
          await participantApi.register({
            email,

            // =============================================
            // PERSONAL INFORMATION
            // =============================================

            FirstName:
              personalData.FirstName,

            MiddleName:
              personalData.MiddleName ||
              undefined,

            LastName:
              personalData.LastName,

            DateOfBirth:
              personalData.DateOfBirth,

            Gender:
              personalData.Gender,

            CivilStatus:
              personalData.CivilStatus,

            MobileNumber:
              personalData.MobileNumber,

            HomeAddress:
              personalData.HomeAddress,

            // =============================================
            // EMERGENCY CONTACT
            // =============================================

            EmergencyContactName:
              emergencyData.EmergencyContactName ||
              undefined,

            EmergencyRelationship:
              emergencyData.EmergencyRelationship ||
              undefined,

            EmergencyContactNumber:
              emergencyData.EmergencyContactNumber ||
              undefined,

            // =============================================
            // PROFILE PHOTO
            // =============================================
            validId:
  validId,

            profileImage:
              profileImage,
          });

        console.log(
          "PARTICIPANT REGISTER RESPONSE:",
          response
        );

        // =================================================
        // REGISTRATION COMPLETE
        // =================================================

       Alert.alert(
  "Registration Complete",
  "Your account and participant profile have been successfully created.",
  [
    {
      text: "OK",
      onPress: () => {
        router.replace("/(auth)/login");
      },
    },
  ],
  {
    cancelable: false,
  }
);
      } catch (error: any) {
        console.error(
          "PARTICIPANT REGISTER ERROR:",
          error
        );

        Alert.alert(
          "Registration Failed",
          error?.message ||
            "Unable to complete your participant registration."
        );

      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // PROFILE STEPPER
  // =====================================================

  const ProfileStepper = ({
    currentStep,
  }: {
    currentStep: 1 | 2 | 3;
  }) => {
    return (
      <View style={styles.stepper}>

        {/* =============================================
            STEP 1
        ============================================= */}

        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 1 &&
                styles.stepCircleActive,
            ]}
          >
            {currentStep > 1 ? (
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= 1 &&
                    styles.stepNumberActive,
                ]}
              >
                1
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.stepLabel,
              currentStep >= 1 &&
                styles.stepLabelActive,
            ]}
          >
            Personal
          </Text>
        </View>

        {/* =============================================
            LINE 1
        ============================================= */}

        <View
          style={[
            styles.stepLine,
            currentStep >= 2 &&
              styles.stepLineActive,
          ]}
        />

        {/* =============================================
            STEP 2
        ============================================= */}

        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 2 &&
                styles.stepCircleActive,
            ]}
          >
            {currentStep > 2 ? (
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= 2 &&
                    styles.stepNumberActive,
                ]}
              >
                2
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.stepLabel,
              currentStep >= 2 &&
                styles.stepLabelActive,
            ]}
          >
            Emergency
          </Text>
        </View>

        {/* =============================================
            LINE 2
        ============================================= */}

        <View
          style={[
            styles.stepLine,
            currentStep >= 3 &&
              styles.stepLineActive,
          ]}
        />

        {/* =============================================
            STEP 3
        ============================================= */}

        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= 3 &&
                styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= 3 &&
                  styles.stepNumberActive,
              ]}
            >
              3
            </Text>
          </View>

          <Text
            style={[
              styles.stepLabel,
              currentStep >= 3 &&
                styles.stepLabelActive,
            ]}
          >
            Profile Photo
          </Text>
        </View>

      </View>
    );
  };

  // =====================================================
  // OTP SCREEN
  // =====================================================

  if (step === "otp") {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <OTPVerification
          email={form.Email}
          onVerified={
            handleOtpVerified
          }
        />
      </SafeAreaView>
    );
  }

  // =====================================================
  // PERSONAL INFORMATION
  // STEP 1
  // =====================================================

  if (step === "personal") {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
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
              styles.content
            }
          >

            <ProfileStepper
              currentStep={1}
            />

            <PersonalInformation
              email={form.Email}
              loading={loading}
              onComplete={
                handlePersonalComplete
              }
            />

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // =====================================================
  // EMERGENCY CONTACT
  // STEP 2
  // =====================================================

  if (step === "emergency") {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
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
              styles.content
            }
          >

            <ProfileStepper
              currentStep={2}
            />

            <EmergencyContactStep
              loading={loading}
              onBack={
                handleBackToPersonal
              }
              onComplete={
                handleEmergencyComplete
              }
            />

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // =====================================================
  // PROFILE PHOTO
  // STEP 3
  // =====================================================

  if (step === "photo") {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
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
              styles.content
            }
          >

            {/* STEPPER */}

            <ProfileStepper
              currentStep={3}
            />

            {/* PROFILE PHOTO */}

            <View style={styles.photoContainer}>

              <Text style={styles.photoStepTitle}>
                Profile Photo
              </Text>

              <Text
                style={styles.photoStepDescription}
              >
                Add a clear photo of yourself
                for your participant profile.
              </Text>

             <ProfilePhotoPicker
  value={profileImage}
  onChange={
    handleProfilePhotoChange
  }
  disabled={loading}
/>

<View style={styles.validIdContainer}>

  <ValidIdPicker
    value={validId}
    onChange={
      handleValidIdChange
    }
    disabled={loading}
  />

</View>

              {/* ACTION BUTTONS */}

              <View
                style={styles.photoActions}
              >

                <Pressable
                  disabled={loading}
                  onPress={
                    handleBackToEmergency
                  }
                  style={[
                    styles.backButton,
                    loading &&
                      styles.buttonDisabled,
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#334155"
                  />

                  <Text
                    style={
                      styles.backButtonText
                    }
                  >
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  disabled={
                    loading ||
                    !profileImage ||
                    !validId
                  }
                  onPress={
                    handleCompleteRegistration
                  }
                  style={[
                    styles.completeButton,
                    (!profileImage ||!validId||
                      loading) &&
                      styles.buttonDisabled,
                  ]}
                >
                  {loading ? (
                    <Text
                      style={
                        styles.completeButtonText
                      }
                    >
                      Completing...
                    </Text>
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.completeButtonText
                        }
                      >
                        Complete
                      </Text>
                    </>
                  )}
                </Pressable>

              </View>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // =====================================================
  // ACCOUNT SCREEN
  // =====================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
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
            styles.content
          }
        >

          <AccountStep
            form={form}
            updateForm={updateForm}
            loading={loading}
            onContinue={
              handleContinue
            }
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  // ===================================================
  // STEPPER
  // ===================================================

  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingHorizontal: 4,
  },

  stepItem: {
    alignItems: "center",
    width: 82,
  },

  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleActive: {
    backgroundColor: "#0038A8",
    borderColor: "#0038A8",
  },

  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  stepNumberActive: {
    color: "#FFFFFF",
  },

  stepLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
  },

  stepLabelActive: {
    color: "#0038A8",
    fontWeight: "700",
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginTop: 18,
    marginHorizontal: 4,
  },

  stepLineActive: {
    backgroundColor: "#0038A8",
  },

  // ===================================================
  // PHOTO STEP
  // ===================================================

  photoContainer: {
    width: "100%",
  },
validIdContainer: {
  marginTop: 24,
},
  photoStepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  photoStepDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginBottom: 20,
  },

  photoActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  backButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  completeButton: {
    flex: 1.4,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#0038A8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  completeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});