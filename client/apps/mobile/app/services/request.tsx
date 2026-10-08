"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import DateTimePicker from "@react-native-community/datetimepicker";

import type { Service } from "@repo/types";

import { serviceApi } from "@/api/api";

/* ============================================================
   HELPERS
============================================================ */

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ============================================================
   SERVICE REQUEST PAGE
============================================================ */

export default function RequestServicePage() {
  const params =
    useLocalSearchParams<{
      serviceId?: string;
    }>();

  const serviceId =
    typeof params.serviceId === "string"
      ? params.serviceId
      : "";

  /* ==========================================================
     SERVICE
  ========================================================== */

  const [service, setService] =
    useState<Service | null>(null);

  const [isLoadingService, setIsLoadingService] =
    useState(true);

  const [serviceError, setServiceError] =
    useState<string | null>(null);

  /* ==========================================================
     FORM
  ========================================================== */

  const [applicantName, setApplicantName] =
    useState("");

  const [applicantEmail, setApplicantEmail] =
    useState("");

  const [preferredDate, setPreferredDate] =
    useState<Date | null>(null);

  const [remarks, setRemarks] =
    useState("");

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  /* ==========================================================
     LOAD SERVICE
  ========================================================== */

  const loadService = useCallback(
    async () => {
      if (!serviceId) {
        setServiceError(
          "No service was selected.",
        );

        setIsLoadingService(false);

        return;
      }

      try {
        setIsLoadingService(true);
        setServiceError(null);

        const result =
          await serviceApi.getAll();

        const selected =
          Array.isArray(result)
            ? result.find(
                (item: Service) =>
                  String(item.id) ===
                  String(serviceId),
              )
            : null;

        if (!selected) {
          setServiceError(
            "The selected service could not be found.",
          );

          setService(null);

          return;
        }

        setService(selected);
      } catch (error) {
        console.error(
          "FAILED TO LOAD SERVICE:",
          error,
        );

        setServiceError(
          "We couldn't load this service right now. Please try again.",
        );
      } finally {
        setIsLoadingService(false);
      }
    },
    [serviceId],
  );

  useEffect(() => {
    void loadService();
  }, [loadService]);

  /* ==========================================================
     SERVICE ICON
  ========================================================== */

  const serviceIcon =
    useMemo(() => {
      const category =
        service?.category?.toLowerCase() ??
        "";

      if (
        category.includes("training") ||
        category.includes("development") ||
        category.includes("education")
      ) {
        return "school-outline" as const;
      }

      if (
        category.includes("mediation") ||
        category.includes("conflict") ||
        category.includes("resolution")
      ) {
        return "people-outline" as const;
      }

      if (
        category.includes("consult") ||
        category.includes("advisory")
      ) {
        return "shield-checkmark-outline" as const;
      }

      if (
        category.includes("management") ||
        category.includes("organizational")
      ) {
        return "layers-outline" as const;
      }

      return "sparkles-outline" as const;
    }, [service]);

  /* ==========================================================
     DATE PICKER
  ========================================================== */

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (
      event?.type === "dismissed"
    ) {
      return;
    }

    if (selectedDate) {
      setPreferredDate(
        selectedDate,
      );
    }
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async () => {
    if (!service) {
      return;
    }

    const name =
      applicantName.trim();

    const email =
      applicantEmail.trim();

    const message =
      remarks.trim();

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!name) {
      setSubmitError(
        "Please enter your full name.",
      );

      return;
    }

    if (!email) {
      setSubmitError(
        "Please enter your email address.",
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setSubmitError(
        "Please enter a valid email address.",
      );

      return;
    }

    if (!preferredDate) {
      setSubmitError(
        "Please select your preferred date.",
      );

      return;
    }

    /* --------------------------------------------------------
       SUBMIT
    -------------------------------------------------------- */

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      /*
       * IMPORTANT:
       * preferredDate is included here because
       * the mobile request form now supports it.
       *
       * If your current backend DTO already has
       * preferredDate, this will map directly.
       */

      const request = {
        serviceId: service.id,
        applicantName: name,
        applicantEmail: email,
        preferredDate:
          formatDateForApi(
            preferredDate,
          ),
        remarks:
          message || null,
      } as any;

      await serviceApi.createRequest(
        request,
      );

      setSubmitSuccess(true);
    } catch (error) {
      console.error(
        "FAILED TO SUBMIT SERVICE REQUEST:",
        error,
      );

      setSubmitError(
        "We couldn't submit your service request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoadingService) {
    return (
      <View
        style={styles.loadingScreen}
      >
        <View
          style={styles.loadingIcon}
        >
          <ActivityIndicator
            size="small"
            color="#002B5C"
          />
        </View>

        <Text
          style={styles.loadingTitle}
        >
          Loading Service
        </Text>

        <Text
          style={styles.loadingText}
        >
          Please wait...
        </Text>
      </View>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (!service) {
    return (
      <View
        style={styles.errorScreen}
      >
        <View
          style={styles.errorIcon}
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text
          style={styles.errorTitle}
        >
          Service Not Available
        </Text>

        <Text
          style={styles.errorText}
        >
          {serviceError ??
            "The selected service could not be loaded."}
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={17}
            color="#FFFFFF"
          />

          <Text
            style={styles.backButtonText}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  if (submitSuccess) {
    return (
      <View
        style={styles.successScreen}
      >
        <View
          style={styles.successIcon}
        >
          <Ionicons
            name="checkmark"
            size={38}
            color="#16A34A"
          />
        </View>

        <Text
          style={styles.successTitle}
        >
          Request Submitted
        </Text>

        <Text
          style={styles.successText}
        >
          Your service request has been
          submitted successfully.
        </Text>

        <View
          style={styles.successServiceCard}
        >
          <View
            style={styles.successServiceIcon}
          >
            <Ionicons
              name={serviceIcon}
              size={21}
              color="#002B5C"
            />
          </View>

          <View
            style={styles.successServiceContent}
          >
            <Text
              style={
                styles.successServiceLabel
              }
            >
              REQUESTED SERVICE
            </Text>

            <Text
              style={
                styles.successServiceName
              }
              numberOfLines={2}
            >
              {service.name}
            </Text>
          </View>
        </View>

        <Text
          style={styles.successNote}
        >
          ACE NextGen will review your
          request and contact you using
          the email address you provided.
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.successButton}
        >
          <Text
            style={styles.successButtonText}
          >
            Done
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <View style={styles.screen}>
      {/* ======================================================
          HEADER
      ======================================================= */}

      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.back()
          }
          style={({ pressed }) => [
            styles.headerBackButton,
            pressed &&
              styles.headerBackPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#002B5C"
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.headerEyebrow}
          >
            SERVICE REQUEST
          </Text>

          <Text
            style={styles.headerTitle}
          >
            Request a Service
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
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
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              SERVICE HERO
          =================================================== */}

          <View
            style={styles.serviceHero}
          >
            <View
              style={styles.serviceImage}
            >
              {service.imageUrl ? (
                <Image
                  source={{
                    uri: service.imageUrl,
                  }}
                  style={
                    styles.serviceImageSource
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.serviceImageFallback
                  }
                >
                  <Ionicons
                    name={serviceIcon}
                    size={45}
                    color="#6FD1D7"
                  />
                </View>
              )}

              <View
                style={
                  styles.serviceImageOverlay
                }
              />

              <View
                style={styles.serviceBadge}
              >
                <Ionicons
                  name={serviceIcon}
                  size={12}
                  color="#002B5C"
                />

                <Text
                  style={
                    styles.serviceBadgeText
                  }
                >
                  {service.requiresTraining
                    ? "TRAINING-BASED"
                    : service.category}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.serviceHeroContent
              }
            >
              <Text
                style={styles.serviceCode}
              >
                {service.serviceCode}
              </Text>

              <Text
                style={styles.serviceName}
              >
                {service.name}
              </Text>

              <Text
                style={
                  styles.serviceCategory
                }
              >
                {service.category}
              </Text>

              <Text
                style={
                  styles.serviceDescription
                }
              >
                {service.description ||
                  "Professional service provided by ACE NextGen Consultancy Inc."}
              </Text>
            </View>
          </View>

          {/* ==================================================
              FORM HEADER
          =================================================== */}

          <View
            style={styles.formHeader}
          >
            <View
              style={styles.formHeaderIcon}
            >
              <Ionicons
                name="document-text-outline"
                size={19}
                color="#002B5C"
              />
            </View>

            <View
              style={styles.formHeaderContent}
            >
              <Text
                style={styles.formTitle}
              >
                Request Details
              </Text>

              <Text
                style={styles.formSubtitle}
              >
                Tell us how we can assist you.
              </Text>
            </View>
          </View>

          {/* ==================================================
              ERROR
          =================================================== */}

          {submitError && (
            <View
              style={styles.errorMessage}
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
              />

              <Text
                style={styles.errorMessageText}
              >
                {submitError}
              </Text>
            </View>
          )}

          {/* ==================================================
              FULL NAME
          =================================================== */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Full Name
            </Text>

            <View
              style={styles.inputContainer}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color="#94A3B8"
              />

              <TextInput
                value={applicantName}
                onChangeText={
                  setApplicantName
                }
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                maxLength={200}
                editable={!isSubmitting}
                style={styles.input}
              />
            </View>
          </View>

          {/* ==================================================
              EMAIL
          =================================================== */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Email Address
            </Text>

            <View
              style={styles.inputContainer}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color="#94A3B8"
              />

              <TextInput
                value={applicantEmail}
                onChangeText={
                  setApplicantEmail
                }
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={320}
                editable={!isSubmitting}
                style={styles.input}
              />
            </View>
          </View>

          {/* ==================================================
              PREFERRED DATE
          =================================================== */}

          <View
            style={styles.field}
          >
            <Text
              style={styles.label}
            >
              Preferred Date
            </Text>

            <Pressable
              onPress={() => {
                if (!isSubmitting) {
                  setShowDatePicker(true);
                }
              }}
              style={({ pressed }) => [
                styles.dateButton,
                pressed &&
                  styles.dateButtonPressed,
              ]}
            >
              <View
                style={
                  styles.dateButtonLeft
                }
              >
                <View
                  style={styles.dateIcon}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#002B5C"
                  />
                </View>

                <Text
                  style={[
                    styles.dateText,
                    !preferredDate &&
                      styles.datePlaceholder,
                  ]}
                >
                  {preferredDate
                    ? formatDate(
                        preferredDate,
                      )
                    : "Select preferred date"}
                </Text>
              </View>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#64748B"
              />
            </Pressable>

            {showDatePicker && (
              <View
                style={
                  styles.datePickerContainer
                }
              >
                <DateTimePicker
                  value={
                    preferredDate ??
                    new Date()
                  }
                  mode="date"
                  display={
                    Platform.OS === "ios"
                      ? "spinner"
                      : "default"
                  }
                  minimumDate={
                    new Date()
                  }
                  onChange={
                    handleDateChange
                  }
                />

                {Platform.OS ===
                  "ios" && (
                  <Pressable
                    onPress={() =>
                      setShowDatePicker(
                        false,
                      )
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
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* ==================================================
              REMARKS
          =================================================== */}

          <View
            style={styles.field}
          >
            <View
              style={styles.labelRow}
            >
              <Text
                style={styles.label}
              >
                Message / Remarks
              </Text>

              <Text
                style={styles.optionalText}
              >
                OPTIONAL
              </Text>
            </View>

            <View
              style={[
                styles.textAreaContainer,
                isSubmitting &&
                  styles.disabledInput,
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#94A3B8"
              />

              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Tell us briefly about the service you need..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                maxLength={2000}
                editable={!isSubmitting}
                textAlignVertical="top"
                style={
                  styles.textArea
                }
              />
            </View>

            <Text
              style={styles.characterCount}
            >
              {remarks.length}/2000
            </Text>
          </View>

          {/* ==================================================
              SELECTED SERVICE
          =================================================== */}

          <View
            style={styles.selectedService}
          >
            <View
              style={
                styles.selectedServiceIcon
              }
            >
              <Ionicons
                name="layers-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.selectedServiceContent
              }
            >
              <Text
                style={
                  styles.selectedServiceLabel
                }
              >
                SELECTED SERVICE
              </Text>

              <Text
                style={
                  styles.selectedServiceName
                }
                numberOfLines={2}
              >
                {service.name}
              </Text>

              <Text
                style={
                  styles.selectedServiceCategory
                }
              >
                {service.category}
              </Text>
            </View>
          </View>

          {/* ==================================================
              REQUIREMENTS
          =================================================== */}

          {service.requirements &&
            service.requirements.length >
              0 && (
              <View
                style={
                  styles.requirementsCard
                }
              >
                <View
                  style={
                    styles.requirementsHeader
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.requirementsTitle
                    }
                  >
                    Service Requirements
                  </Text>
                </View>

                {[
                  ...service.requirements,
                ]
                  .sort(
                    (a, b) =>
                      a.displayOrder -
                      b.displayOrder,
                  )
                  .slice(0, 5)
                  .map(
                    (requirement) => (
                      <View
                        key={
                          requirement.id
                        }
                        style={
                          styles.requirementRow
                        }
                      >
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#16A34A"
                        />

                        <Text
                          style={
                            styles.requirementText
                          }
                        >
                          {
                            requirement.name
                          }

                          {requirement.isRequired && (
                            <Text
                              style={
                                styles.requiredStar
                              }
                            >
                              {" "}
                              *
                            </Text>
                          )}
                        </Text>
                      </View>
                    ),
                  )}
              </View>
            )}

          {/* ==================================================
              SUBMIT
          =================================================== */}

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed &&
                !isSubmitting &&
                styles.submitButtonPressed,
              isSubmitting &&
                styles.submitButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  Submitting...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  Request This Service
                </Text>

                <View
                  style={
                    styles.submitButtonIcon
                  }
                >
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#002B5C"
                  />
                </View>
              </>
            )}
          </Pressable>

          {/* ==================================================
              NOTE
          =================================================== */}

          <View
            style={styles.bottomNote}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#64748B"
            />

            <Text
              style={styles.bottomNoteText}
            >
              Your request will be reviewed
              individually by ACE NextGen.
              Our team will contact you
              regarding the next step.
            </Text>
          </View>

          <View
            style={styles.bottomSpacing}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EEF3",
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF4FF",
  },

  headerBackPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2563EB",
  },

  headerTitle: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: "900",
    color: "#002B5C",
  },

  /* ==========================================================
     SERVICE HERO
  ========================================================== */

  serviceHero: {
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },

  serviceImage: {
    height: 150,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#DCE9FF",
  },

  serviceImageSource: {
    width: "100%",
    height: "100%",
  },

  serviceImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCE9FF",
  },

  serviceImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
    backgroundColor: "rgba(0,0,0,0.30)",
  },

  serviceBadge: {
    position: "absolute",
    left: 13,
    bottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor:
      "rgba(255,255,255,0.94)",
  },

  serviceBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#002B5C",
  },

  serviceHeroContent: {
    padding: 16,
  },

  serviceCode: {
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: "#2563EB",
  },

  serviceName: {
    marginTop: 5,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    color: "#002B5C",
  },

  serviceCategory: {
    marginTop: 4,
    fontSize: 8.5,
    fontWeight: "700",
    color: "#94A3B8",
  },

  serviceDescription: {
    marginTop: 9,
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
  },

  /* ==========================================================
     FORM HEADER
  ========================================================== */

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },

  formHeaderIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCE9FF",
  },

  formHeaderContent: {
    marginLeft: 10,
  },

  formTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#002B5C",
  },

  formSubtitle: {
    marginTop: 2,
    fontSize: 8.5,
    color: "#8A98A8",
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorMessageText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 9,
    lineHeight: 14,
    color: "#B91C1C",
  },

  /* ==========================================================
     FORM
  ========================================================== */

  field: {
    marginBottom: 17,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  label: {
    marginBottom: 7,
    fontSize: 9.5,
    fontWeight: "900",
    color: "#002B5C",
  },

  optionalText: {
    marginBottom: 7,
    fontSize: 6.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#94A3B8",
  },

  inputContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 11,
    fontSize: 10,
    color: "#334155",
  },

  /* ==========================================================
     DATE
  ========================================================== */

  dateButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  dateButtonPressed: {
    opacity: 0.75,
  },

  dateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF4FF",
  },

  dateText: {
    marginLeft: 9,
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },

  datePlaceholder: {
    fontWeight: "500",
    color: "#94A3B8",
  },

  datePickerContainer: {
    marginTop: 8,
    overflow: "hidden",
    alignItems: "center",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  dateDoneButton: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  dateDoneText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#2563EB",
  },

  /* ==========================================================
     TEXT AREA
  ========================================================== */

  textAreaContainer: {
    minHeight: 125,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 13,
    paddingTop: 13,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  textArea: {
    flex: 1,
    marginLeft: 9,
    minHeight: 100,
    paddingTop: 0,
    fontSize: 10,
    lineHeight: 16,
    color: "#334155",
  },

  disabledInput: {
    opacity: 0.6,
  },

  characterCount: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 7,
    color: "#94A3B8",
  },

  /* ==========================================================
     SELECTED SERVICE
  ========================================================== */

  selectedService: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 13,
    marginTop: 2,
    borderRadius: 14,
    backgroundColor: "#EFF4FF",
    borderWidth: 1,
    borderColor: "#DCE9FF",
  },

  selectedServiceIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  selectedServiceContent: {
    flex: 1,
    marginLeft: 9,
  },

  selectedServiceLabel: {
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: "#2563EB",
  },

  selectedServiceName: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    color: "#002B5C",
  },

  selectedServiceCategory: {
    marginTop: 2,
    fontSize: 7.5,
    color: "#64748B",
  },

  /* ==========================================================
     REQUIREMENTS
  ========================================================== */

  requirementsCard: {
    marginTop: 13,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },

  requirementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  requirementsTitle: {
    marginLeft: 7,
    fontSize: 9.5,
    fontWeight: "900",
    color: "#002B5C",
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 7,
  },

  requirementText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 8.5,
    lineHeight: 13,
    color: "#64748B",
  },

  requiredStar: {
    color: "#DC2626",
    fontWeight: "900",
  },

  /* ==========================================================
     SUBMIT
  ========================================================== */

  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingLeft: 17,
    paddingRight: 10,
    borderRadius: 14,
    backgroundColor: "#002B5C",
    shadowColor: "#002B5C",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  submitButtonPressed: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  submitButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  /* ==========================================================
     NOTE
  ========================================================== */

  bottomNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 10,
  },

  bottomNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 7.5,
    lineHeight: 12,
    textAlign: "center",
    color: "#94A3B8",
  },

  bottomSpacing: {
    height: 25,
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7F9FB",
  },

  loadingIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCE9FF",
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "900",
    color: "#002B5C",
  },

  loadingText: {
    marginTop: 4,
    fontSize: 9,
    color: "#94A3B8",
  },

  /* ==========================================================
     ERROR SCREEN
  ========================================================== */

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    backgroundColor: "#F7F9FB",
  },

  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },

  errorTitle: {
    marginTop: 17,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    color: "#002B5C",
  },

  errorText: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    color: "#64748B",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#002B5C",
  },

  backButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  /* ==========================================================
     SUCCESS
  ========================================================== */

  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F7F9FB",
  },

  successIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
  },

  successTitle: {
    marginTop: 20,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    color: "#002B5C",
  },

  successText: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    color: "#64748B",
  },

  successServiceCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },

  successServiceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF4FF",
  },

  successServiceContent: {
    flex: 1,
    marginLeft: 10,
  },

  successServiceLabel: {
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#2563EB",
  },

  successServiceName: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "900",
    color: "#002B5C",
  },

  successNote: {
    marginTop: 15,
    fontSize: 8.5,
    lineHeight: 14,
    textAlign: "center",
    color: "#8A98A8",
  },

  successButton: {
    width: "100%",
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 25,
    borderRadius: 13,
    backgroundColor: "#002B5C",
  },

  successButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});