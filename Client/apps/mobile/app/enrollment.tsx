import React, { useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

// ============================================================
// TYPES
// ============================================================

type DocumentStatus =
  | "required"
  | "uploaded";

type RequiredDocument = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
};

// ============================================================
// MOCK DATA
// ============================================================

const INITIAL_DOCUMENTS: RequiredDocument[] = [
  {
    id: "DOC-001",
    title: "Valid ID",
    description:
      "Upload a valid government-issued identification.",
    required: true,
    status: "required",
  },

  {
    id: "DOC-002",
    title: "Proof of Eligibility",
    description:
      "Upload a document showing your eligibility for the training.",
    required: true,
    status: "required",
  },

  {
    id: "DOC-003",
    title: "Profile Photo",
    description:
      "Upload a recent 2x2 or passport-size photo.",
    required: true,
    status: "required",
  },

  {
    id: "DOC-004",
    title: "Supporting Document",
    description:
      "Additional document if required by the training program.",
    required: false,
    status: "required",
  },
];

// ============================================================
// SCREEN
// ============================================================

export default function EnrollmentScreen() {
  const router = useRouter();

  const [documents, setDocuments] =
    useState<RequiredDocument[]>(
      INITIAL_DOCUMENTS,
    );

  const [submitted, setSubmitted] =
    useState(false);

  // ==========================================================
  // REQUIRED DOCUMENTS
  // ==========================================================

  const requiredDocuments =
    documents.filter(
      (document) => document.required,
    );

  const uploadedRequiredDocuments =
    requiredDocuments.filter(
      (document) =>
        document.status === "uploaded",
    );

  const allRequiredUploaded =
    uploadedRequiredDocuments.length ===
    requiredDocuments.length;

  const progress =
    requiredDocuments.length === 0
      ? 100
      : Math.round(
          (uploadedRequiredDocuments.length /
            requiredDocuments.length) *
            100,
        );

  // ==========================================================
  // MOCK UPLOAD
  // ==========================================================

  function handleUpload(
    documentId: string,
  ) {
    const document = documents.find(
      (item) => item.id === documentId,
    );

    if (!document) {
      return;
    }

    if (document.status === "uploaded") {
      Alert.alert(
        "Document Uploaded",
        `${document.title} has already been uploaded.`,
      );

      return;
    }

    // --------------------------------------------------------
    // MOCK FILE UPLOAD
    // --------------------------------------------------------

    const mockFileName =
      `${document.title
        .replace(/\s+/g, "_")
        .toLowerCase()}_juan_dela_cruz.pdf`;

    setDocuments((previous) =>
      previous.map((item) =>
        item.id === documentId
          ? {
              ...item,
              status: "uploaded",
              fileName: mockFileName,
            }
          : item,
      ),
    );

    Alert.alert(
      "Document Uploaded",
      `${document.title} has been attached successfully.`,
    );
  }

  // ==========================================================
  // REMOVE DOCUMENT
  // ==========================================================

  function handleRemove(
    documentId: string,
  ) {
    setDocuments((previous) =>
      previous.map((item) =>
        item.id === documentId
          ? {
              ...item,
              status: "required",
              fileName: undefined,
            }
          : item,
      ),
    );
  }

  // ==========================================================
  // SUBMIT ENROLLMENT
  // ==========================================================

  function handleSubmit() {
    if (!allRequiredUploaded) {
      Alert.alert(
        "Required Documents",
        "Please upload all required documents before submitting your enrollment.",
      );

      return;
    }

    Alert.alert(
      "Submit Enrollment",
      "Are you sure you want to submit your enrollment application?",
      [
        {
          text: "Review",
          style: "cancel",
        },

        {
          text: "Submit",
          onPress: () => {
            setSubmitted(true);
          },
        },
      ],
    );
  }

  // ==========================================================
  // SUCCESS / SUBMITTED
  // ==========================================================

  if (submitted) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.successContent
          }
        >
          {/* BACK */}

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.replace("/training")
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          {/* SUCCESS */}

          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark"
                size={40}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.successTitle}>
              Enrollment Submitted
            </Text>

            <Text style={styles.successDescription}>
              Your enrollment application has
              been submitted successfully and is
              now waiting for admin review.
            </Text>

            {/* STATUS */}

            <View style={styles.pendingCard}>
              <View style={styles.pendingIcon}>
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#D97706"
                />
              </View>

              <View style={styles.pendingInfo}>
                <Text style={styles.pendingTitle}>
                  Pending Review
                </Text>

                <Text style={styles.pendingDescription}>
                  The administrator will review your
                  submitted documents.
                </Text>
              </View>
            </View>

            {/* APPLICATION ID */}

            <View style={styles.applicationCard}>
              <Text
                style={styles.applicationLabel}
              >
                APPLICATION ID
              </Text>

              <Text
                style={styles.applicationId}
              >
                ENR-2026-0001
              </Text>

              <Text
                style={styles.applicationDate}
              >
                Submitted August 19, 2026
              </Text>
            </View>
          </View>

          {/* WHAT HAPPENS NEXT */}

          <Text style={styles.nextTitle}>
            What happens next?
          </Text>

          <EnrollmentStep
            number="1"
            icon="document-text-outline"
            title="Documents Reviewed"
            description="Admin checks your submitted requirements."
            active
          />

          <EnrollmentStep
            number="2"
            icon="checkmark-circle-outline"
            title="Enrollment Decision"
            description="Your application will be approved or rejected."
          />

          <EnrollmentStep
            number="3"
            icon="school-outline"
            title="Training Access"
            description="Once approved, you can access your training."
          />

          {/* BACK TO TRAINING */}

          <Pressable
            style={styles.trainingButton}
            onPress={() =>
              router.replace("/training")
            }
          >
            <Text
              style={styles.trainingButtonText}
            >
              Back to Training
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    );
  }

  // ==========================================================
  // ENROLLMENT FORM
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              Enrollment
            </Text>

            <Text style={styles.subtitle}>
              Submit your requirements to enroll
              in this training program.
            </Text>
          </View>
        </View>

        {/* ====================================================
            TRAINING
        ==================================================== */}

        <View style={styles.trainingCard}>
          <View style={styles.trainingIcon}>
            <Ionicons
              name="school"
              size={27}
              color="#2563EB"
            />
          </View>

          <View style={styles.trainingInfo}>
            <Text style={styles.trainingLabel}>
              TRAINING PROGRAM
            </Text>

            <Text style={styles.trainingName}>
              Leadership Training
            </Text>

            <View style={styles.trainingDetail}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#64748B"
              />

              <Text
                style={styles.trainingDetailText}
              >
                August 12–16, 2026
              </Text>
            </View>

            <View style={styles.trainingDetail}>
              <Ionicons
                name="location-outline"
                size={13}
                color="#64748B"
              />

              <Text
                style={styles.trainingDetailText}
              >
                Training Center
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            PARTICIPANT
        ==================================================== */}

        <Text style={styles.sectionTitle}>
          Participant Information
        </Text>

        <View style={styles.participantCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.participantInfo}>
            <Text
              style={styles.participantName}
            >
              Juan Dela Cruz
            </Text>

            <Text
              style={styles.participantEmail}
            >
              juan@email.com
            </Text>

            <View
              style={styles.verifiedRow}
            >
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#16A34A"
              />

              <Text
                style={styles.verifiedText}
              >
                Verified Account
              </Text>
            </View>
          </View>

          <View style={styles.accountBadge}>
            <Text
              style={styles.accountBadgeText}
            >
              PARTICIPANT
            </Text>
          </View>
        </View>

        {/* ====================================================
            REQUIREMENTS
        ==================================================== */}

        <View style={styles.requirementHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Required Documents
            </Text>

            <Text
              style={styles.requirementDescription}
            >
              Upload the documents required for
              this training.
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text
              style={styles.progressBadgeText}
            >
              {progress}%
            </Text>
          </View>
        </View>

        {/* PROGRESS */}

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressDescription}>
          {uploadedRequiredDocuments.length} of{" "}
          {requiredDocuments.length} required
          documents uploaded
        </Text>

        {/* ====================================================
            DOCUMENT LIST
        ==================================================== */}

        <View style={styles.documentsCard}>
          {documents.map(
            (document, index) => (
              <DocumentItem
                key={document.id}
                document={document}
                isLast={
                  index ===
                  documents.length - 1
                }
                onUpload={() =>
                  handleUpload(
                    document.id,
                  )
                }
                onRemove={() =>
                  handleRemove(
                    document.id,
                  )
                }
              />
            ),
          )}
        </View>

        {/* ====================================================
            IMPORTANT NOTE
        ==================================================== */}

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.noteText}>
            Make sure your uploaded documents are
            clear and readable. Admin may reject
            incomplete or invalid documents.
          </Text>
        </View>

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <Pressable
          style={[
            styles.submitButton,
            !allRequiredUploaded &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Ionicons
            name="send-outline"
            size={18}
            color={
              allRequiredUploaded
                ? "#FFFFFF"
                : "#94A3B8"
            }
          />

          <Text
            style={[
              styles.submitButtonText,
              !allRequiredUploaded &&
                styles.submitButtonTextDisabled,
            ]}
          >
            Submit Enrollment
          </Text>
        </Pressable>

        {!allRequiredUploaded && (
          <Text style={styles.submitHint}>
            Upload all required documents to
            continue.
          </Text>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// DOCUMENT ITEM
// ============================================================

function DocumentItem({
  document,
  isLast,
  onUpload,
  onRemove,
}: {
  document: RequiredDocument;
  isLast: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const uploaded =
    document.status === "uploaded";

  return (
    <View
      style={[
        styles.documentItem,
        !isLast &&
          styles.documentItemBorder,
      ]}
    >
      {/* ICON */}

      <View
        style={[
          styles.documentIcon,
          uploaded &&
            styles.documentIconUploaded,
        ]}
      >
        <Ionicons
          name={
            uploaded
              ? "checkmark"
              : "document-text-outline"
          }
          size={21}
          color={
            uploaded
              ? "#16A34A"
              : "#2563EB"
          }
        />
      </View>

      {/* INFO */}

      <View style={styles.documentInfo}>
        <View
          style={styles.documentTitleRow}
        >
          <Text
            style={styles.documentTitle}
          >
            {document.title}
          </Text>

          {document.required ? (
            <View
              style={styles.requiredBadge}
            >
              <Text
                style={
                  styles.requiredBadgeText
                }
              >
                REQUIRED
              </Text>
            </View>
          ) : (
            <View
              style={styles.optionalBadge}
            >
              <Text
                style={
                  styles.optionalBadgeText
                }
              >
                OPTIONAL
              </Text>
            </View>
          )}
        </View>

        {uploaded ? (
          <>
            <Text
              style={styles.uploadedFile}
              numberOfLines={1}
            >
              {document.fileName}
            </Text>

            <Text
              style={styles.uploadedStatus}
            >
              Uploaded successfully
            </Text>
          </>
        ) : (
          <Text
            style={styles.documentDescription}
          >
            {document.description}
          </Text>
        )}
      </View>

      {/* ACTION */}

      {uploaded ? (
        <Pressable
          style={styles.removeButton}
          onPress={onRemove}
        >
          <Ionicons
            name="trash-outline"
            size={17}
            color="#DC2626"
          />
        </Pressable>
      ) : (
        <Pressable
          style={styles.uploadButton}
          onPress={onUpload}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={16}
            color="#2563EB"
          />

          <Text
            style={styles.uploadButtonText}
          >
            Upload
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ============================================================
// ENROLLMENT STEP
// ============================================================

function EnrollmentStep({
  number,
  icon,
  title,
  description,
  active,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepNumber,
          active &&
            styles.stepNumberActive,
        ]}
      >
        <Text
          style={[
            styles.stepNumberText,
            active &&
              styles.stepNumberTextActive,
          ]}
        >
          {number}
        </Text>
      </View>

      <View
        style={[
          styles.stepIcon,
          active &&
            styles.stepIconActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            active
              ? "#2563EB"
              : "#94A3B8"
          }
        />
      </View>

      <View style={styles.stepInfo}>
        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 110,
  },

  successContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 110,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 4,
  },

  // ==========================================================
  // TRAINING CARD
  // ==========================================================

  trainingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
    flexDirection: "row",
    marginBottom: 27,
  },

  trainingIcon: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trainingInfo: {
    flex: 1,
  },

  trainingLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },

  trainingName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },

  trainingDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  trainingDetailText: {
    fontSize: 9,
    color: "#64748B",
    marginLeft: 5,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  participantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
    marginBottom: 27,
  },

  avatar: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  participantInfo: {
    flex: 1,
  },

  participantName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  participantEmail: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  verifiedText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#16A34A",
    marginLeft: 4,
  },

  accountBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  accountBadgeText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#2563EB",
  },

  // ==========================================================
  // REQUIREMENT HEADER
  // ==========================================================

  requirementHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  requirementDescription: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  progressBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  progressBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 13,
  },

  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  progressDescription: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 5,
    marginBottom: 11,
  },

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  documentsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  documentItem: {
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  documentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  documentIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  documentIconUploaded: {
    backgroundColor: "#DCFCE7",
  },

  documentInfo: {
    flex: 1,
    marginRight: 7,
  },

  documentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  documentTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  requiredBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 5,
  },

  requiredBadgeText: {
    fontSize: 5,
    fontWeight: "800",
    color: "#DC2626",
  },

  optionalBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 5,
  },

  optionalBadgeText: {
    fontSize: 5,
    fontWeight: "800",
    color: "#64748B",
  },

  documentDescription: {
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
    marginTop: 3,
  },

  uploadedFile: {
    fontSize: 8,
    fontWeight: "700",
    color: "#334155",
    marginTop: 3,
  },

  uploadedStatus: {
    fontSize: 7,
    color: "#16A34A",
    fontWeight: "700",
    marginTop: 2,
  },

  uploadButton: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  uploadButtonText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
  },

  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // NOTE
  // ==========================================================

  noteCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 13,
  },

  noteText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: "#475569",
    marginLeft: 7,
  },

  // ==========================================================
  // SUBMIT
  // ==========================================================

  submitButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  submitButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },

  submitButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  submitButtonTextDisabled: {
    color: "#94A3B8",
  },

  submitHint: {
    fontSize: 8,
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 7,
  },

  // ==========================================================
  // SUCCESS
  // ==========================================================

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 22,
    alignItems: "center",
    marginTop: 15,
  },

  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 17,
  },

  successDescription: {
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    color: "#64748B",
    marginTop: 7,
  },

  pendingCard: {
    width: "100%",
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  pendingInfo: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
  },

  pendingDescription: {
    fontSize: 8,
    lineHeight: 13,
    color: "#A16207",
    marginTop: 2,
  },

  applicationCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 13,
    marginTop: 10,
    alignItems: "center",
  },

  applicationLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },

  applicationId: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 4,
  },

  applicationDate: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  // ==========================================================
  // NEXT STEPS
  // ==========================================================

  nextTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 27,
    marginBottom: 12,
  },

  step: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 9,
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumberActive: {
    backgroundColor: "#EFF6FF",
  },

  stepNumberText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
  },

  stepNumberTextActive: {
    color: "#2563EB",
  },

  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
    marginRight: 9,
  },

  stepIconActive: {
    backgroundColor: "#EFF6FF",
  },

  stepInfo: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  stepDescription: {
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
    marginTop: 2,
  },

  trainingButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  trainingButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 30,
  },
});