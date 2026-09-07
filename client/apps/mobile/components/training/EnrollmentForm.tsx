import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as DocumentPicker from "expo-document-picker";

import type {
  TrainingBatch,
  TrainingProgramRequirement,
} from "@repo/types";

import { enrollmentApi, participantApi } from "@/api/api";

import { useMe } from "@repo/hooks";


// =========================================================
// TYPES
// =========================================================

export interface EnrollmentDocumentUpload {
  requirementId: string;

  requirementName: string;

  file: {
    uri: string;
    name: string;
    type?: string;
  };
}


export interface EnrollmentFormData {
  participantName: string;

  email: string;

  mobileNumber: string;

  documents: EnrollmentDocumentUpload[];
}


interface Props {
  training: TrainingBatch;

  initialData?: EnrollmentFormData;

  onBack: () => void;

  onContinue: (
    data: EnrollmentFormData
  ) => void;
}


// =========================================================
// COMPONENT
// =========================================================

export default function EnrollmentForm({
  training,
  initialData,
  onBack,
  onContinue,
}: Props) {

  // =======================================================
  // PARTICIPANT PROFILE
  // =======================================================

  const {
    profile,
    isLoading,
    error,
    refetch,
  } = useMe(participantApi);


  // =======================================================
  // PARTICIPANT INFORMATION
  //
  // These values come directly from the logged-in
  // participant profile.
  //
  // No useState is needed because the participant
  // should not edit these fields here.
  // =======================================================

  const participantName = [
    profile?.firstName,
    profile?.middleName,
    profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const email =
    profile?.email ?? "";

  const mobileNumber =
    profile?.mobileNumber ?? "";


  // =======================================================
  // DOCUMENTS
  // =======================================================

  const [documents, setDocuments] =
    useState<EnrollmentDocumentUpload[]>(
      initialData?.documents ?? []
    );


  // =======================================================
  // REQUIREMENTS
  // =======================================================

  const [requirements, setRequirements] =
    useState<TrainingProgramRequirement[]>(
      []
    );

  const [isLoadingRequirements, setIsLoadingRequirements] =
    useState(true);


  // =======================================================
  // DOCUMENT PICKING
  // =======================================================

  const [selectingRequirementId, setSelectingRequirementId] =
    useState<string | null>(null);


  // =======================================================
  // LOAD REQUIREMENTS
  // =======================================================

  useEffect(() => {

    let mounted = true;

    const loadRequirements = async () => {

      try {

        setIsLoadingRequirements(true);

        const result =
          await enrollmentApi.getRequirements(
            training.id
          );

        if (mounted) {

          setRequirements(result);

        }

      } catch (error) {

        console.error(
          "LOAD REQUIREMENTS ERROR:",
          error
        );

        if (mounted) {

          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "Failed to load training requirements."
          );

        }

      } finally {

        if (mounted) {

          setIsLoadingRequirements(false);

        }

      }

    };


    loadRequirements();


    return () => {

      mounted = false;

    };

  }, [training.id]);


  // =======================================================
  // REQUIRED REQUIREMENTS
  // =======================================================

  const requiredRequirements =
    useMemo(
      () =>
        requirements.filter(
          requirement =>
            requirement.isRequired
        ),
      [requirements]
    );


  // =======================================================
  // OPTIONAL REQUIREMENTS
  // =======================================================

  const optionalRequirements =
    useMemo(
      () =>
        requirements.filter(
          requirement =>
            !requirement.isRequired
        ),
      [requirements]
    );


  // =======================================================
  // GET DOCUMENT
  // =======================================================

  const getDocument = (
    requirementId: string
  ) => {

    return documents.find(
      document =>
        document.requirementId ===
        requirementId
    );

  };


  // =======================================================
  // PICK DOCUMENT
  // =======================================================

  const pickDocument = async (
    requirement: TrainingProgramRequirement
  ) => {

    try {

      setSelectingRequirementId(
        requirement.id
      );


      // ===================================================
      // DOCUMENT PICKER
      // ===================================================

      const result =
        await DocumentPicker.getDocumentAsync({
          type: "*/*",

          copyToCacheDirectory: true,

          multiple: false,
        });


      // ===================================================
      // USER CANCELLED
      // ===================================================

      if (
        result.canceled ||
        !result.assets ||
        result.assets.length === 0
      ) {

        return;

      }


      const file =
        result.assets[0];


      // ===================================================
      // VALIDATE FILE
      // ===================================================

      if (!file.uri) {

        Alert.alert(
          "Invalid File",
          "The selected file could not be accessed."
        );

        return;

      }


      // ===================================================
      // CREATE DOCUMENT
      // ===================================================

      const selectedDocument:
        EnrollmentDocumentUpload = {

        requirementId:
          requirement.id,

        requirementName:
          requirement.name,

        file: {

          uri:
            file.uri,

          name:
            file.name ||
            requirement.name,

          type:
            file.mimeType ??
            "application/octet-stream",

        },

      };


      // ===================================================
      // REPLACE EXISTING FILE
      // FOR THE SAME REQUIREMENT
      // ===================================================

      setDocuments(
        current => [

          ...current.filter(
            document =>
              document.requirementId !==
              requirement.id
          ),

          selectedDocument,

        ]
      );

    } catch (error) {

      console.error(
        "DOCUMENT PICKER ERROR:",
        error
      );

      Alert.alert(
        "Document Error",
        "Unable to select this document."
      );

    } finally {

      setSelectingRequirementId(
        null
      );

    }

  };


  // =======================================================
  // REMOVE DOCUMENT
  // =======================================================

  const removeDocument = (
    requirementId: string
  ) => {

    setDocuments(
      current =>
        current.filter(
          document =>
            document.requirementId !==
            requirementId
        )
    );

  };


  // =======================================================
  // VALIDATE FORM
  // =======================================================

  const validateForm = () => {

    // -----------------------------------------------------
    // PARTICIPANT NAME
    // -----------------------------------------------------

    if (
      !participantName.trim()
    ) {

      Alert.alert(
        "Profile Required",
        "Your name is missing from your participant profile."
      );

      return false;

    }


    // -----------------------------------------------------
    // EMAIL
    // -----------------------------------------------------

    if (
      !email.trim()
    ) {

      Alert.alert(
        "Profile Required",
        "Your email address is missing from your participant profile."
      );

      return false;

    }


    // -----------------------------------------------------
    // MOBILE
    // -----------------------------------------------------

    if (
      !mobileNumber.trim()
    ) {

      Alert.alert(
        "Profile Required",
        "Your mobile number is missing from your participant profile."
      );

      return false;

    }


    // -----------------------------------------------------
    // REQUIRED DOCUMENTS
    // -----------------------------------------------------

    const missingRequirements =
      requiredRequirements.filter(
        requirement =>
          !documents.some(
            document =>
              document.requirementId ===
              requirement.id
          )
      );


    if (
      missingRequirements.length > 0
    ) {

      const missingNames =
        missingRequirements
          .map(
            requirement =>
              `• ${requirement.name}`
          )
          .join("\n");


      Alert.alert(
        "Required Documents",
        `Please upload all required documents:\n\n${missingNames}`
      );

      return false;

    }


    return true;

  };


  // =======================================================
  // CONTINUE
  // =======================================================

  const handleContinue = () => {

    // -----------------------------------------------------
    // VALIDATE
    // -----------------------------------------------------

    if (
      !validateForm()
    ) {

      return;

    }


    // -----------------------------------------------------
    // CREATE FORM DATA
    //
    // participantName
    // email
    // mobileNumber
    //
    // are all taken directly from profile.
    // -----------------------------------------------------

    const data: EnrollmentFormData = {

      participantName:
        participantName.trim(),

      email:
        email.trim(),

      mobileNumber:
        mobileNumber.trim(),

      documents,

    };


    // -----------------------------------------------------
    // SEND TO PARENT
    // -----------------------------------------------------

    onContinue(data);

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (
    isLoading ||
    isLoadingRequirements
  ) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading your information...
        </Text>

      </View>

    );

  }


  // =======================================================
  // PROFILE ERROR
  // =======================================================

  if (
    error
  ) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#DC2626"
        />

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load your profile
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Please try again before continuing
          with your enrollment.
        </Text>


        <Pressable
          onPress={
            refetch
          }

          style={
            styles.retryButton
          }
        >

          <Text
            style={
              styles.retryText
            }
          >
            Try Again
          </Text>

        </Pressable>

      </View>

    );

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

        contentContainerStyle={
          styles.content
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
        >

          <Pressable
            onPress={
              onBack
            }

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
              styles.headerText
            }
          >

            <Text
              style={
                styles.step
              }
            >
              STEP 1 OF 2
            </Text>


            <Text
              style={
                styles.title
              }
            >
              Enrollment Form
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Your participant information is
              automatically loaded from your profile.
            </Text>

          </View>

        </View>


        {/* =================================================
            TRAINING
        ================================================= */}

        <View
          style={
            styles.trainingCard
          }
        >

          <View
            style={
              styles.trainingIcon
            }
          >

            <Ionicons
              name="school-outline"
              size={22}
              color="#2563EB"
            />

          </View>


          <View
            style={
              styles.trainingContent
            }
          >

            <Text
              style={
                styles.trainingLabel
              }
            >
              TRAINING PROGRAM
            </Text>


            <Text
              style={
                styles.trainingTitle
              }
            >
              {training.programName}
            </Text>


            <Text
              style={
                styles.trainingCode
              }
            >
              Batch: {training.batchCode}
            </Text>

          </View>

        </View>


        {/* =================================================
            PARTICIPANT INFORMATION
        ================================================= */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Participant Information
          </Text>


          <Text
            style={
              styles.sectionSubtitle
            }
          >
            This information comes from your
            participant account and cannot be edited
            during enrollment.
          </Text>


          {/* =================================================
              FULL NAME
          ================================================= */}

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
              FULL NAME
            </Text>


            <View
              style={
                styles.inputBox
              }
            >

              <Ionicons
                name="person-outline"
                size={17}
                color="#64748B"
              />


              <TextInput
                value={
                  participantName
                }

                placeholder="Your full name"

                placeholderTextColor="#94A3B8"

                editable={false}

                autoCapitalize="words"

                style={
                  styles.input
                }
              />

            </View>

          </View>


          {/* =================================================
              EMAIL
          ================================================= */}

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
              EMAIL ADDRESS
            </Text>


            <View
              style={
                styles.inputBox
              }
            >

              <Ionicons
                name="mail-outline"
                size={17}
                color="#64748B"
              />


              <TextInput
                value={
                  email
                }

                editable={false}

                placeholder="Your email address"

                placeholderTextColor="#94A3B8"

                keyboardType="email-address"

                autoCapitalize="none"

                autoCorrect={false}

                style={
                  styles.input
                }
              />

            </View>

          </View>


          {/* =================================================
              MOBILE NUMBER
          ================================================= */}

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
              MOBILE NUMBER
            </Text>


            <View
              style={
                styles.inputBox
              }
            >

              <Ionicons
                name="call-outline"
                size={17}
                color="#64748B"
              />


              <TextInput
                value={
                  mobileNumber
                }

                editable={false}

                placeholder="Your mobile number"

                placeholderTextColor="#94A3B8"

                keyboardType="phone-pad"

                style={
                  styles.input
                }
              />

            </View>

          </View>

        </View>


        {/* =================================================
            REQUIRED DOCUMENTS
        ================================================= */}

        <View
          style={
            styles.section
          }
        >

          <View
            style={
              styles.documentsHeader
            }
          >

            <View
              style={
                styles.documentsHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Required Documents
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Upload the documents configured
                for this training program.
              </Text>

            </View>


            <View
              style={
                styles.countBadge
              }
            >

              <Text
                style={
                  styles.countText
                }
              >
                {
                  documents.filter(
                    document =>
                      requiredRequirements.some(
                        requirement =>
                          requirement.id ===
                          document.requirementId
                      )
                  ).length
                } / {
                  requiredRequirements.length
                }
              </Text>

            </View>

          </View>


          {/* =================================================
              NO REQUIRED DOCUMENTS
          ================================================= */}

          {
            requiredRequirements.length === 0 ? (

              <View
                style={
                  styles.noRequirements
                }
              >

                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#16A34A"
                />


                <Text
                  style={
                    styles.noRequirementsText
                  }
                >
                  No required documents for this
                  training program.
                </Text>

              </View>

            ) : (

              requiredRequirements.map(
                requirement => {

                  const uploaded =
                    getDocument(
                      requirement.id
                    );


                  const selecting =
                    selectingRequirementId ===
                    requirement.id;


                  return (

                    <View
                      key={
                        requirement.id
                      }

                      style={
                        styles.documentCard
                      }
                    >

                      {/* =====================================
                          DOCUMENT HEADER
                      ===================================== */}

                      <View
                        style={
                          styles.documentTop
                        }
                      >

                        <View
                          style={
                            styles.documentIcon
                          }
                        >

                          <Ionicons
                            name={
                              uploaded
                                ? "checkmark"
                                : "document-text-outline"
                            }

                            size={19}

                            color={
                              uploaded
                                ? "#16A34A"
                                : "#2563EB"
                            }
                          />

                        </View>


                        <View
                          style={
                            styles.documentInfo
                          }
                        >

                          <Text
                            style={
                              styles.documentName
                            }
                          >
                            {
                              requirement.name
                            }
                          </Text>


                          {
                            requirement.description ? (

                              <Text
                                style={
                                  styles.documentDescription
                                }
                              >
                                {
                                  requirement.description
                                }
                              </Text>

                            ) : null
                          }

                        </View>


                        <View
                          style={
                            styles.requiredBadge
                          }
                        >

                          <Text
                            style={
                              styles.requiredText
                            }
                          >
                            REQUIRED
                          </Text>

                        </View>

                      </View>


                      {/* =====================================
                          UPLOADED FILE
                      ===================================== */}

                      {
                        uploaded ? (

                          <View
                            style={
                              styles.uploadedBox
                            }
                          >

                            <View
                              style={
                                styles.uploadedInfo
                              }
                            >

                              <Ionicons
                                name="checkmark-circle"
                                size={19}
                                color="#16A34A"
                              />


                              <View
                                style={
                                  styles.uploadedTextContainer
                                }
                              >

                                <Text
                                  numberOfLines={1}
                                  style={
                                    styles.uploadedName
                                  }
                                >
                                  {
                                    uploaded.file.name
                                  }
                                </Text>


                                <Text
                                  style={
                                    styles.uploadedStatus
                                  }
                                >
                                  Ready to submit
                                </Text>

                              </View>

                            </View>


                            <Pressable
                              onPress={() =>
                                removeDocument(
                                  requirement.id
                                )
                              }

                              style={
                                styles.removeButton
                              }
                            >

                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#DC2626"
                              />

                            </Pressable>

                          </View>

                        ) : (

                          /* =================================
                             PICK FILE
                          ================================= */

                          <Pressable
                            onPress={() =>
                              pickDocument(
                                requirement
                              )
                            }

                            disabled={
                              selecting
                            }

                            style={
                              styles.uploadButton
                            }
                          >

                            {
                              selecting ? (

                                <ActivityIndicator
                                  size="small"
                                  color="#2563EB"
                                />

                              ) : (

                                <Ionicons
                                  name="cloud-upload-outline"
                                  size={19}
                                  color="#2563EB"
                                />

                              )
                            }


                            <View>

                              <Text
                                style={
                                  styles.uploadButtonText
                                }
                              >
                                {
                                  selecting
                                    ? "Selecting..."
                                    : "Choose Document"
                                }
                              </Text>


                              <Text
                                style={
                                  styles.uploadHint
                                }
                              >
                                PDF, image, Word or other
                                supported file
                              </Text>

                            </View>

                          </Pressable>

                        )
                      }

                    </View>

                  );

                }
              )

            )
          }

        </View>


        {/* =================================================
            OPTIONAL DOCUMENTS
        ================================================= */}

        {
          optionalRequirements.length > 0 && (

            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Optional Documents
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                These documents are optional.
              </Text>


              {
                optionalRequirements.map(
                  requirement => {

                    const uploaded =
                      getDocument(
                        requirement.id
                      );


                    return (

                      <View
                        key={
                          requirement.id
                        }

                        style={
                          styles.documentCard
                        }
                      >

                        <View
                          style={
                            styles.documentTop
                          }
                        >

                          <View
                            style={
                              styles.documentIcon
                            }
                          >

                            <Ionicons
                              name="document-outline"
                              size={19}
                              color="#64748B"
                            />

                          </View>


                          <View
                            style={
                              styles.documentInfo
                            }
                          >

                            <Text
                              style={
                                styles.documentName
                              }
                            >
                              {
                                requirement.name
                              }
                            </Text>


                            {
                              requirement.description ? (

                                <Text
                                  style={
                                    styles.documentDescription
                                  }
                                >
                                  {
                                    requirement.description
                                  }
                                </Text>

                              ) : null
                            }

                          </View>

                        </View>


                        {
                          uploaded ? (

                            <View
                              style={
                                styles.uploadedBox
                              }
                            >

                              <View
                                style={
                                  styles.uploadedInfo
                                }
                              >

                                <Ionicons
                                  name="checkmark-circle"
                                  size={19}
                                  color="#16A34A"
                                />


                                <Text
                                  numberOfLines={1}
                                  style={
                                    styles.uploadedName
                                  }
                                >
                                  {
                                    uploaded.file.name
                                  }
                                </Text>

                              </View>


                              <Pressable
                                onPress={() =>
                                  removeDocument(
                                    requirement.id
                                  )
                                }
                              >

                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#DC2626"
                                />

                              </Pressable>

                            </View>

                          ) : (

                            <Pressable
                              onPress={() =>
                                pickDocument(
                                  requirement
                                )
                              }

                              style={
                                styles.uploadButton
                              }
                            >

                              <Ionicons
                                name="cloud-upload-outline"
                                size={19}
                                color="#2563EB"
                              />


                              <View>

                                <Text
                                  style={
                                    styles.uploadButtonText
                                  }
                                >
                                  Choose Document
                                </Text>


                                <Text
                                  style={
                                    styles.uploadHint
                                  }
                                >
                                  PDF, image, Word or other
                                  supported file
                                </Text>

                              </View>

                            </Pressable>

                          )
                        }

                      </View>

                    );

                  }
                )
              }

            </View>

          )
        }


        {/* =================================================
            NOTICE
        ================================================= */}

        <View
          style={
            styles.notice
          }
        >

          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#2563EB"
          />


          <Text
            style={
              styles.noticeText
            }
          >
            Your information and documents will
            be submitted securely for administrator
            review.
          </Text>

        </View>


        {/* =================================================
            CONTINUE
        ================================================= */}

        <Pressable
          onPress={
            handleContinue
          }

          style={
            styles.continueButton
          }
        >

          <Text
            style={
              styles.continueText
            }
          >
            Continue to Review
          </Text>


          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />

        </Pressable>


        <Text
          style={
            styles.bottomNote
          }
        >
          You can review your application before
          final submission.
        </Text>

      </ScrollView>

    </View>

  );

}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    content: {
      padding: 20,
      paddingBottom: 100,
    },

    loadingContainer: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 10,
      fontWeight: "700",
      color: "#64748B",
      textAlign: "center",
    },

    errorTitle: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "900",
      color: "#0F172A",
      textAlign: "center",
    },

    errorText: {
      marginTop: 6,
      fontSize: 9,
      lineHeight: 14,
      color: "#64748B",
      textAlign: "center",
    },

    retryButton: {
      marginTop: 18,
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor: "#2563EB",
    },

    retryText: {
      fontSize: 9,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    step: {
      fontSize: 7,
      fontWeight: "900",
      letterSpacing: 1,
      color: "#2563EB",
    },

    title: {
      marginTop: 3,
      fontSize: 22,
      fontWeight: "900",
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 8,
      lineHeight: 13,
      color: "#64748B",
    },

    trainingCard: {
      marginTop: 20,
      padding: 14,
      borderRadius: 18,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
      flexDirection: "row",
      alignItems: "center",
    },

    trainingIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    trainingContent: {
      flex: 1,
      marginLeft: 10,
    },

    trainingLabel: {
      fontSize: 5.5,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#60A5FA",
    },

    trainingTitle: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: "800",
      color: "#1E3A8A",
    },

    trainingCode: {
      marginTop: 3,
      fontSize: 7,
      color: "#64748B",
    },

    section: {
      marginTop: 24,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: "#0F172A",
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 8,
      lineHeight: 13,
      color: "#94A3B8",
    },

    inputGroup: {
      marginTop: 12,
    },

    inputLabel: {
      marginBottom: 6,
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: "#94A3B8",
    },

    inputBox: {
      minHeight: 48,
      paddingHorizontal: 13,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    input: {
      flex: 1,
      marginLeft: 9,
      paddingVertical: 11,
      fontSize: 9,
      fontWeight: "600",
      color: "#0F172A",
    },

    documentsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    documentsHeaderText: {
      flex: 1,
      marginRight: 10,
    },

    countBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#EFF6FF",
    },

    countText: {
      fontSize: 7,
      fontWeight: "900",
      color: "#2563EB",
    },

    documentCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    documentTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    documentIcon: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    documentInfo: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
    },

    documentName: {
      fontSize: 9,
      fontWeight: "800",
      color: "#334155",
    },

    documentDescription: {
      marginTop: 3,
      fontSize: 7,
      lineHeight: 11,
      color: "#94A3B8",
    },

    requiredBadge: {
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "#FEF2F2",
    },

    requiredText: {
      fontSize: 5,
      fontWeight: "900",
      letterSpacing: 0.4,
      color: "#DC2626",
    },

    uploadButton: {
      minHeight: 48,
      marginTop: 12,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: "#BFDBFE",
      borderStyle: "dashed",
      backgroundColor: "#F8FBFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    uploadButtonText: {
      fontSize: 8,
      fontWeight: "800",
      color: "#2563EB",
    },

    uploadHint: {
      marginTop: 2,
      fontSize: 6.5,
      color: "#94A3B8",
    },

    uploadedBox: {
      marginTop: 12,
      padding: 10,
      borderRadius: 13,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    uploadedInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    uploadedTextContainer: {
      flex: 1,
      marginLeft: 8,
    },

    uploadedName: {
      fontSize: 8,
      fontWeight: "700",
      color: "#166534",
    },

    uploadedStatus: {
      marginTop: 2,
      fontSize: 6.5,
      color: "#16A34A",
    },

    removeButton: {
      marginLeft: 10,
      padding: 4,
    },

    noRequirements: {
      marginTop: 12,
      padding: 15,
      borderRadius: 14,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    noRequirementsText: {
      flex: 1,
      fontSize: 8,
      fontWeight: "700",
      color: "#166534",
    },

    notice: {
      marginTop: 20,
      padding: 13,
      borderRadius: 15,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 9,
    },

    noticeText: {
      flex: 1,
      fontSize: 7.5,
      lineHeight: 12,
      color: "#475569",
    },

    continueButton: {
      height: 52,
      marginTop: 21,
      borderRadius: 16,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    continueText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    bottomNote: {
      marginTop: 8,
      textAlign: "center",
      fontSize: 7,
      lineHeight: 11,
      color: "#94A3B8",
    },

  });