import React, {
  useCallback,
  useEffect,
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import {
  useForgotPassword,
  useParticipant,
} from "@repo/hooks";

import {
  AppAlert,
} from "@repo/ui-mobile";

import type {
  UpdateParticipantProfile,
} from "@repo/types";

import {
  participantProfileApi,
  authAPIs,
} from "@/api/api";

import { auth } from "@/api/auth";

const PRIMARY = "#002b5c";

export default function ProfileScreen() {
  const router = useRouter();

  const {
    profile,
    isLoading,
    isSubmitting,
    error,
    refreshProfile,
    updateMyProfile,
    updateProfileImage,
  } = useParticipant(
    participantProfileApi
  );

  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isLoading: isPasswordLoading,
    error: passwordError,
    reset: resetPasswordState,
  } = useForgotPassword(authAPIs);

  // =====================================================
  // APP ALERT
  // =====================================================

  const [isLogoutAlertVisible, setIsLogoutAlertVisible] =
    useState(false);

  const [isLogoutErrorVisible, setIsLogoutErrorVisible] =
    useState(false);

  const [logoutErrorMessage, setLogoutErrorMessage] =
    useState(
      "Unable to logout from your account."
    );

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [isUploadingImage, setIsUploadingImage] =
    useState(false);

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const [isEditProfileVisible, setIsEditProfileVisible] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState<UpdateParticipantProfile>({
      firstName: "",
      middleName: "",
      lastName: "",
      mobileNumber: "",
      birthDate: "",
      address: "",
      gender: "",
    });

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  const [passwordStep, setPasswordStep] =
    useState<"request" | "otp" | "reset">(
      "request"
    );

  const [passwordOtp, setPasswordOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // =====================================================
  // REFRESH
  // =====================================================

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    if (!profile) {
      refreshProfile().catch(() => {});
    }
  }, [profile, refreshProfile]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = useCallback(
    async () => {
      try {
        setRefreshing(true);
        await refreshProfile();
      } catch {
        // Error handled by hook.
      } finally {
        setRefreshing(false);
      }
    },
    [refreshProfile]
  );

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = useCallback(() => {
    if (!profile) {
      return "P";
    }

    const first =
      profile.firstName
        ?.trim()
        ?.charAt(0) ?? "";

    const last =
      profile.lastName
        ?.trim()
        ?.charAt(0) ?? "";

    const initials =
      `${first}${last}`.toUpperCase();

    return initials || "P";
  }, [profile]);

  // =====================================================
  // FULL NAME
  // =====================================================

  const fullName =
    profile?.fullName?.trim() ||
    `${profile?.firstName ?? ""} ${
      profile?.lastName ?? ""
    }`.trim() ||
    "Participant";

  // =====================================================
  // CHANGE PROFILE IMAGE
  // =====================================================

  const handleChangeProfileImage =
    useCallback(async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow photo library access to change your profile picture."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const asset =
          result.assets[0];

        const fileName =
          asset.fileName ||
          `profile-${Date.now()}.jpg`;

        const mimeType =
          asset.mimeType ||
          "image/jpeg";

        setIsUploadingImage(true);

        await updateProfileImage({
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        });

        Alert.alert(
          "Profile Updated",
          "Your profile picture has been updated successfully."
        );
      } catch (err) {
        Alert.alert(
          "Upload Failed",
          err instanceof Error
            ? err.message
            : "Unable to update your profile picture."
        );
      } finally {
        setIsUploadingImage(false);
      }
    }, [updateProfileImage]);

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditProfile = useCallback(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      firstName:
        profile.firstName ?? "",

      middleName:
        profile.middleName ?? "",

      lastName:
        profile.lastName ?? "",

      mobileNumber:
        profile.mobileNumber ?? "",

      birthDate:
        profile.birthDate ?? "",

      address:
        profile.address ?? "",

      gender:
        profile.gender ?? "",
    });

    setIsEditProfileVisible(true);
  }, [profile]);

  const closeEditProfile = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsEditProfileVisible(false);
  }, [isSubmitting]);

  const updateProfileField = useCallback(
    (
      field: keyof UpdateParticipantProfile,
      value: string
    ) => {
      setProfileForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    []
  );

  const handleSaveProfile = useCallback(
    async () => {
      if (!profile) {
        return;
      }

      if (
        !profileForm.firstName.trim() ||
        !profileForm.lastName.trim()
      ) {
        Alert.alert(
          "Incomplete Information",
          "First name and last name are required."
        );

        return;
      }

      try {
        await updateMyProfile({
          firstName:
            profileForm.firstName.trim(),

          middleName:
            profileForm.middleName.trim(),

          lastName:
            profileForm.lastName.trim(),

          mobileNumber:
            profileForm.mobileNumber.trim(),

          birthDate:
            profileForm.birthDate.trim(),

          address:
            profileForm.address.trim(),

          gender:
            profileForm.gender.trim(),
        });

        setIsEditProfileVisible(false);

        Alert.alert(
          "Profile Updated",
          "Your profile information has been updated successfully."
        );
      } catch (err) {
        Alert.alert(
          "Update Failed",
          err instanceof Error
            ? err.message
            : "Unable to update your profile."
        );
      }
    },
    [
      profile,
      profileForm,
      updateMyProfile,
    ]
  );

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const openChangePassword = useCallback(() => {
    if (!profile?.email) {
      Alert.alert(
        "Unavailable",
        "Your account email could not be loaded."
      );

      return;
    }

    resetPasswordState();

    setPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordStep("request");
    setIsPasswordVisible(true);
  }, [
    profile?.email,
    resetPasswordState,
  ]);

  const closeChangePassword = useCallback(() => {
    if (isPasswordLoading) {
      return;
    }

    setIsPasswordVisible(false);

    setPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordStep("request");

    resetPasswordState();
  }, [
    isPasswordLoading,
    resetPasswordState,
  ]);

  const handleRequestPasswordOtp =
    useCallback(async () => {
      if (!profile?.email) {
        return;
      }

      const response =
        await forgotPassword({
          email: profile.email,
        });

      if (!response) {
        return;
      }

      Alert.alert(
        "Verification Code Sent",
        `A password reset code has been sent to ${profile.email}.`
      );

      setPasswordStep("otp");
    }, [
      forgotPassword,
      profile?.email,
    ]);

  const handleVerifyPasswordOtp =
    useCallback(async () => {
      if (!profile?.email) {
        return;
      }

      if (!passwordOtp.trim()) {
        Alert.alert(
          "OTP Required",
          "Please enter the verification code."
        );

        return;
      }

      const response =
        await verifyResetOtp({
          email: profile.email,
          otpCode:
            passwordOtp.trim(),
        });

      if (!response) {
        return;
      }

      setPasswordStep("reset");
    }, [
      passwordOtp,
      profile?.email,
      verifyResetOtp,
    ]);

  const handleResetPassword =
    useCallback(async () => {
      if (!profile?.email) {
        return;
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        Alert.alert(
          "Incomplete Information",
          "Please enter your new password and confirm it."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        Alert.alert(
          "Password Mismatch",
          "The passwords do not match."
        );

        return;
      }

      const response =
        await resetPassword({
          email: profile.email,
          otpCode:
            passwordOtp.trim(),
          newPassword,
          confirmPassword,
        });

      if (!response) {
        return;
      }

      Alert.alert(
        "Password Updated",
        "Your password has been changed successfully.",
        [
          {
            text: "OK",
            onPress:
              closeChangePassword,
          },
        ]
      );
    }, [
      closeChangePassword,
      confirmPassword,
      newPassword,
      passwordOtp,
      profile?.email,
      resetPassword,
    ]);

  // =====================================================
  // HEADER SETTINGS
  // =====================================================

  const handleSettingsPress = useCallback(() => {
    Alert.alert(
      "Settings",
      "Additional account settings will be available here."
    );
  }, []);

  // =====================================================
  // HELP & SUPPORT
  // =====================================================

  const handleHelpSupport = useCallback(() => {
    Alert.alert(
      "Help & Support",
      "Help and support information will be connected to the ACE NextGen support service."
    );
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutAlertVisible(true);
  }, [isLoggingOut]);

  // =====================================================
  // CONFIRM LOGOUT
  // =====================================================

  const handleConfirmLogout =
    useCallback(async () => {
      if (isLoggingOut) {
        return;
      }

      try {
        setIsLogoutAlertVisible(false);
        setIsLoggingOut(true);

        // Clear authentication session.
        await auth.logout();

       
        router.replace(
          "/(auth)/login"
        );
      } catch (err) {
        console.error(
          "LOGOUT ERROR:",
          err
        );

        setIsLoggingOut(false);

        setLogoutErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to logout from your account. Please try again."
        );

        setIsLogoutErrorVisible(true);
      }
    }, [
      isLoggingOut,
      router,
    ]);

  // =====================================================
  // LOGOUT ERROR CLOSE
  // =====================================================

  const handleCloseLogoutError =
    useCallback(() => {
      setIsLogoutErrorVisible(false);
    }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (
    isLoading &&
    !profile
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!profile) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <Ionicons
            name="person-outline"
            size={28}
            color={PRIMARY}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load profile
        </Text>

        <Text
          style={
            styles.errorMessage
          }
        >
          {error?.message ??
            "Something went wrong while loading your profile."}
        </Text>

        <Pressable
          onPress={() =>
            refreshProfile().catch(
              () => {}
            )
          }
          style={({ pressed }) => [
            styles.retryButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // =====================================================
  // MAIN SCREEN
  // =====================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor={PRIMARY}
          />
        }
      >
        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <View
          style={styles.header}
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Profile
          </Text>

          <Pressable
            onPress={
              handleSettingsPress
            }
            style={({ pressed }) => [
              styles.settingsButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={21}
              color={PRIMARY}
            />
          </Pressable>
        </View>

        {/* =========================================== */}
        {/* PROFILE SUMMARY */}
        {/* =========================================== */}

        <View
          style={
            styles.profileSummary
          }
        >
          {/* PROFILE IMAGE + PENCIL */}

          <View
            style={
              styles.profileImageContainer
            }
          >
            <View
              style={
                styles.profileImageWrapper
              }
            >
              {profile.profileImageUrl ? (
                <Image
                  source={{
                    uri:
                      profile.profileImageUrl,
                  }}
                  style={
                    styles.profileImage
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.profileImageFallback
                  }
                >
                  <Text
                    style={
                      styles.profileInitials
                    }
                  >
                    {getInitials()}
                  </Text>
                </View>
              )}
            </View>

            {/* PENCIL BUTTON */}

            <Pressable
              onPress={
                handleChangeProfileImage
              }
              disabled={
                isUploadingImage
              }
              style={({ pressed }) => [
                styles.imageEditButton,
                pressed &&
                  !isUploadingImage &&
                  styles.imageEditPressed,
                isUploadingImage &&
                  styles.disabledButton,
              ]}
            >
              {isUploadingImage ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>

          {/* PROFILE DETAILS */}

          <View
            style={
              styles.profileDetails
            }
          >
            <Text
              style={
                styles.profileName
              }
              numberOfLines={2}
            >
              {fullName}
            </Text>

            <Text
              style={
                styles.profileEmail
              }
              numberOfLines={2}
            >
              {profile.email}
            </Text>

            <View
              style={
                styles.roleContainer
              }
            >
              <Text
                style={
                  styles.roleText
                }
              >
                {profile.role ||
                  "Participant"}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================== */}
        {/* ACCOUNT */}
        {/* =========================================== */}

        <View
          style={
            styles.accountSection
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            ACCOUNT
          </Text>

          <View
            style={
              styles.accountCard
            }
          >
            {/* EDIT PROFILE */}

            <AccountItem
              icon="create-outline"
              title="Edit Profile"
              onPress={
                openEditProfile
              }
            />

            <View
              style={
                styles.divider
              }
            />

            {/* CHANGE PASSWORD */}

            <AccountItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={
                openChangePassword
              }
            />

            <View
              style={
                styles.divider
              }
            />

            {/* HELP & SUPPORT */}

            <AccountItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={
                handleHelpSupport
              }
            />

            <View
              style={
                styles.divider
              }
            />

            {/* ACCOUNT EMAIL */}

            <AccountItem
              icon="mail-outline"
              title="Account Email"
              value={
                profile.email
              }
              showChevron={false}
            />

            <View
              style={
                styles.divider
              }
            />

            {/* ACCOUNT STATUS */}

            <AccountItem
              icon="shield-checkmark-outline"
              title="Account Status"
              value={
                profile.status ||
                "Active"
              }
              status
              showChevron={false}
            />

            <View
              style={
                styles.divider
              }
            />

            {/* LOGOUT */}

            <AccountItem
              icon="log-out-outline"
              title="Logout"
              onPress={
                handleLogout
              }
              danger
            />
          </View>
        </View>

        <View
          style={
            styles.bottomSpacing
          }
        />
      </ScrollView>

      {/* ================================================= */}
      {/* LOGOUT CONFIRMATION APP ALERT */}
      {/* ================================================= */}

      <AppAlert
        visible={
          isLogoutAlertVisible
        }
        type="warning"
        title="Logout"
        message="Are you sure you want to logout from your ACE NextGen account?"
        confirmText={
          isLoggingOut
            ? "Logging out..."
            : "Logout"
        }
        cancelText="Cancel"
        showCancel
        onCancel={() => {
          if (!isLoggingOut) {
            setIsLogoutAlertVisible(
              false
            );
          }
        }}
        onConfirm={
          handleConfirmLogout
        }
      />

      {/* ================================================= */}
      {/* LOGOUT ERROR APP ALERT */}
      {/* ================================================= */}

      <AppAlert
        visible={
          isLogoutErrorVisible
        }
        type="error"
        title="Logout Failed"
        message={
          logoutErrorMessage
        }
        confirmText="OK"
        showCancel={false}
        onConfirm={
          handleCloseLogoutError
        }
      />

      {/* ================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ================================================= */}

      <Modal
        visible={
          isEditProfileVisible
        }
        animationType="slide"
        transparent
        onRequestClose={
          closeEditProfile
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.modalContainer
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
                  Edit Profile
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Update your personal information.
                </Text>
              </View>

              <Pressable
                onPress={
                  closeEditProfile
                }
                disabled={
                  isSubmitting
                }
                style={
                  styles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <ScrollView
              style={
                styles.modalScroll
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <InputField
                label="First Name"
                value={
                  profileForm.firstName
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "firstName",
                    value
                  )
                }
                placeholder="Enter first name"
              />

              <InputField
                label="Middle Name"
                value={
                  profileForm.middleName
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "middleName",
                    value
                  )
                }
                placeholder="Enter middle name"
              />

              <InputField
                label="Last Name"
                value={
                  profileForm.lastName
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "lastName",
                    value
                  )
                }
                placeholder="Enter last name"
              />

              <InputField
                label="Mobile Number"
                value={
                  profileForm.mobileNumber
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "mobileNumber",
                    value
                  )
                }
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
              />

              <InputField
                label="Birth Date"
                value={
                  profileForm.birthDate
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "birthDate",
                    value
                  )
                }
                placeholder="YYYY-MM-DD"
              />

              <InputField
                label="Address"
                value={
                  profileForm.address
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "address",
                    value
                  )
                }
                placeholder="Enter address"
                multiline
              />

              <InputField
                label="Gender"
                value={
                  profileForm.gender
                }
                onChangeText={(value) =>
                  updateProfileField(
                    "gender",
                    value
                  )
                }
                placeholder="Enter gender"
              />

              <View
                style={
                  styles.modalButtonRow
                }
              >
                <Pressable
                  onPress={
                    closeEditProfile
                  }
                  disabled={
                    isSubmitting
                  }
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed &&
                      styles.buttonPressed,
                    isSubmitting &&
                      styles.disabledButton,
                  ]}
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    handleSaveProfile
                  }
                  disabled={
                    isSubmitting
                  }
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed &&
                      styles.buttonPressed,
                    isSubmitting &&
                      styles.disabledButton,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Save Changes
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================= */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ================================================= */}

      <Modal
        visible={
          isPasswordVisible
        }
        animationType="slide"
        transparent
        onRequestClose={
          closeChangePassword
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.modalContainer
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
                  Change Password
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Secure your account with a new password.
                </Text>
              </View>

              <Pressable
                onPress={
                  closeChangePassword
                }
                disabled={
                  isPasswordLoading
                }
                style={
                  styles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <ScrollView
              style={
                styles.modalScroll
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              {/* REQUEST OTP */}

              {passwordStep ===
                "request" && (
                <View>
                  <View
                    style={
                      styles.infoBox
                    }
                  >
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={PRIMARY}
                    />

                    <Text
                      style={
                        styles.infoBoxText
                      }
                    >
                      A verification code will be sent to your registered email address.
                    </Text>
                  </View>

                  <View
                    style={
                      styles.emailPreview
                    }
                  >
                    <Text
                      style={
                        styles.emailPreviewLabel
                      }
                    >
                      Registered Email
                    </Text>

                    <Text
                      style={
                        styles.emailPreviewValue
                      }
                    >
                      {profile.email}
                    </Text>
                  </View>

                  <Pressable
                    onPress={
                      handleRequestPasswordOtp
                    }
                    disabled={
                      isPasswordLoading
                    }
                    style={({ pressed }) => [
                      styles.primaryButtonFull,
                      pressed &&
                        styles.buttonPressed,
                      isPasswordLoading &&
                        styles.disabledButton,
                    ]}
                  >
                    {isPasswordLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Send Verification Code
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}

              {/* OTP */}

              {passwordStep ===
                "otp" && (
                <View>
                  <View
                    style={
                      styles.infoBox
                    }
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={22}
                      color={PRIMARY}
                    />

                    <Text
                      style={
                        styles.infoBoxText
                      }
                    >
                      Enter the verification code sent to your email.
                    </Text>
                  </View>

                  <InputField
                    label="Verification Code"
                    value={
                      passwordOtp
                    }
                    onChangeText={
                      setPasswordOtp
                    }
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                  />

                  {passwordError && (
                    <Text
                      style={
                        styles.formError
                      }
                    >
                      {passwordError}
                    </Text>
                  )}

                  <Pressable
                    onPress={
                      handleVerifyPasswordOtp
                    }
                    disabled={
                      isPasswordLoading
                    }
                    style={({ pressed }) => [
                      styles.primaryButtonFull,
                      pressed &&
                        styles.buttonPressed,
                      isPasswordLoading &&
                        styles.disabledButton,
                    ]}
                  >
                    {isPasswordLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Verify Code
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setPasswordStep(
                        "request"
                      )
                    }
                    disabled={
                      isPasswordLoading
                    }
                    style={
                      styles.textButton
                    }
                  >
                    <Text
                      style={
                        styles.textButtonText
                      }
                    >
                      Send Code Again
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* RESET PASSWORD */}

              {passwordStep ===
                "reset" && (
                <View>
                  <InputField
                    label="New Password"
                    value={
                      newPassword
                    }
                    onChangeText={
                      setNewPassword
                    }
                    placeholder="Enter new password"
                    secureTextEntry
                  />

                  <InputField
                    label="Confirm Password"
                    value={
                      confirmPassword
                    }
                    onChangeText={
                      setConfirmPassword
                    }
                    placeholder="Confirm new password"
                    secureTextEntry
                  />

                  {passwordError && (
                    <Text
                      style={
                        styles.formError
                      }
                    >
                      {passwordError}
                    </Text>
                  )}

                  <Pressable
                    onPress={
                      handleResetPassword
                    }
                    disabled={
                      isPasswordLoading
                    }
                    style={({ pressed }) => [
                      styles.primaryButtonFull,
                      pressed &&
                        styles.buttonPressed,
                      isPasswordLoading &&
                        styles.disabledButton,
                    ]}
                  >
                    {isPasswordLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Update Password
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================= */}
      {/* LOGOUT PROCESSING OVERLAY */}
      {/* ================================================= */}

      {isLoggingOut && (
        <View
          style={
            styles.logoutLoadingOverlay
          }
        >
          <View
            style={
              styles.logoutLoadingCard
            }
          >
            <ActivityIndicator
              size="large"
              color={PRIMARY}
            />

            <Text
              style={
                styles.logoutLoadingTitle
              }
            >
              Logging out...
            </Text>

            <Text
              style={
                styles.logoutLoadingMessage
              }
            >
              Please wait while we securely end your session.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// =====================================================
// ACCOUNT ITEM
// =====================================================

interface AccountItemProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  title: string;

  value?: string;

  status?: boolean;

  showChevron?: boolean;

  danger?: boolean;

  onPress?: () => void;
}

function AccountItem({
  icon,
  title,
  value,
  status = false,
  showChevron = true,
  danger = false,
  onPress,
}: AccountItemProps) {
  const content = (
    <View
      style={
        styles.accountItem
      }
    >
      <View
        style={[
          styles.accountIcon,
          danger &&
            styles.accountIconDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            danger
              ? "#DC2626"
              : PRIMARY
          }
        />
      </View>

      <View
        style={
          styles.accountItemContent
        }
      >
        <Text
          style={[
            styles.accountItemTitle,
            danger &&
              styles.accountItemTitleDanger,
          ]}
        >
          {title}
        </Text>

        {value &&
          !status && (
            <Text
              style={
                styles.accountItemValue
              }
              numberOfLines={1}
            >
              {value}
            </Text>
          )}
      </View>

      {status && (
        <View
          style={
            styles.statusBadge
          }
        >
          <View
            style={
              styles.statusDot
            }
          />

          <Text
            style={
              styles.statusText
            }
          >
            {value}
          </Text>
        </View>
      )}

      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={19}
          color="#94A3B8"
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed &&
          styles.accountItemPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

// =====================================================
// INPUT FIELD
// =====================================================

interface InputFieldProps {
  label: string;

  value: string;

  onChangeText: (
    value: string
  ) => void;

  placeholder?: string;

  keyboardType?: React.ComponentProps<
    typeof TextInput
  >["keyboardType"];

  secureTextEntry?: boolean;

  multiline?: boolean;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline = false,
}: InputFieldProps) {
  return (
    <View
      style={
        styles.inputGroup
      }
    >
      <Text
        style={
          styles.inputLabel
        }
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#94A3B8"
        keyboardType={
          keyboardType
        }
        secureTextEntry={
          secureTextEntry
        }
        multiline={multiline}
        textAlignVertical={
          multiline
            ? "top"
            : "center"
        }
        style={[
          styles.input,
          multiline &&
            styles.multilineInput,
        ]}
      />
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },

  settingsButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E3E9EF",
    backgroundColor: "#FFFFFF",
  },

  // ===================================================
  // PROFILE SUMMARY
  // ===================================================

  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  profileImageContainer: {
    position: "relative",
    width: 94,
    height: 94,
  },

  profileImageWrapper: {
    width: 94,
    height: 94,
    overflow: "hidden",
    borderRadius: 47,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#E7EEF5",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  profileImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F7",
  },

  profileInitials: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY,
  },

  // ===================================================
  // PROFILE IMAGE PENCIL
  // ===================================================

  imageEditButton: {
    position: "absolute",
    right: -2,
    bottom: 1,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#F7F9FB",
    backgroundColor: PRIMARY,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  imageEditPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  // ===================================================
  // PROFILE DETAILS
  // ===================================================

  profileDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: 18,
  },

  profileName: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  profileEmail: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  roleContainer: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#EAF1F7",
  },

  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY,
  },

  // ===================================================
  // ACCOUNT
  // ===================================================

  accountSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
  },

  accountCard: {
    overflow: "hidden",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E4E9EF",
    backgroundColor: "#FFFFFF",
  },

  accountItem: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  accountItemPressed: {
    backgroundColor: "#F8FAFC",
  },

  accountIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#EEF4F8",
  },

  accountIconDanger: {
    backgroundColor: "#FEF2F2",
  },

  accountItemContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
  },

  accountItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  accountItemTitleDanger: {
    color: "#DC2626",
  },

  accountItemValue: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  divider: {
    height: 1,
    marginLeft: 68,
    backgroundColor: "#EEF1F4",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },

  bottomSpacing: {
    height: 20,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F9FB",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  // ===================================================
  // ERROR
  // ===================================================

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7F9FB",
  },

  errorIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderRadius: 31,
    backgroundColor: "#EAF0F6",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ===================================================
  // MODAL
  // ===================================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
  },

  modalContainer: {
    maxHeight: "92%",
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    maxWidth: 280,
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
  },

  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  // ===================================================
  // INPUT
  // ===================================================

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D9E1E8",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#0F172A",
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 13,
  },

  // ===================================================
  // BUTTONS
  // ===================================================

  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9E1E8",
    backgroundColor: "#FFFFFF",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },

  primaryButtonFull: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  // ===================================================
  // PASSWORD
  // ===================================================

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginBottom: 18,
    borderRadius: 14,
    backgroundColor: "#EEF4F8",
  },

  infoBoxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  emailPreview: {
    padding: 14,
    marginBottom: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF0",
    backgroundColor: "#F8FAFC",
  },

  emailPreviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },

  emailPreviewValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  textButton: {
    alignItems: "center",
    paddingVertical: 16,
  },

  textButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },

  formError: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#DC2626",
  },

  // ===================================================
  // LOGOUT LOADING
  // ===================================================

  logoutLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
    paddingHorizontal: 30,
  },

  logoutLoadingCard: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  logoutLoadingTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  logoutLoadingMessage: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },
});