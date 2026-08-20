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

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

type DocumentType =
  | "validId"
  | "proofOfAddress"
  | "supportingDocument";

type UploadedDocument = {
  name: string;
  uri: string;
};

export default function EnrollmentScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      trainingId?: string;
    }>();

  const trainingId =
    params.trainingId ?? "TRN-001";

  const [documents, setDocuments] =
    useState<
      Partial<
        Record<
          DocumentType,
          UploadedDocument
        >
      >
    >({});

  const [submitting, setSubmitting] =
    useState(false);

  const training = {
    title:
      "Leadership Development Training",

    trainer: "Maria Santos",

    schedule:
      "August 20 - September 15, 2026",

    location:
      "ACE NextGen Training Center",
  };

  function mockUpload(
    type: DocumentType,
    label: string
  ) {
    setDocuments((current) => ({
      ...current,
      [type]: {
        name: `${label}.pdf`,
        uri: "mock://uploaded-document",
      },
    }));
  }

  const allUploaded =
    Boolean(documents.validId) &&
    Boolean(
      documents.proofOfAddress
    ) &&
    Boolean(
      documents.supportingDocument
    );

  async function handleSubmit() {
    if (!allUploaded) {
      Alert.alert(
        "Required Documents",
        "Please upload all required documents before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * LATER:
       *
       * POST /api/enrollments
       *
       * {
       *   trainingBatchId: trainingId,
       *   documents: [...]
       * }
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      Alert.alert(
        "Enrollment Submitted",
        "Your enrollment has been submitted for admin review.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/training"
              ),
          },
        ]
      );
    } catch {
      Alert.alert(
        "Submission Failed",
        "Unable to submit your enrollment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* HEADER */}

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

        <Text style={styles.title}>
          Training Enrollment
        </Text>

        <Text style={styles.subtitle}>
          Complete your enrollment by
          submitting the required documents.
        </Text>

        {/* TRAINING */}

        <View style={styles.trainingCard}>
          <View style={styles.trainingIcon}>
            <Ionicons
              name="school"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.trainingInfo}>
            <Text style={styles.trainingLabel}>
              ENROLLING IN
            </Text>

            <Text style={styles.trainingTitle}>
              {training.title}
            </Text>

            <Text style={styles.trainingTrainer}>
              Trainer: {training.trainer}
            </Text>
          </View>
        </View>

        {/* ACCOUNT */}

        <Text style={styles.sectionTitle}>
          Participant Account
        </Text>

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Ionicons
              name="person"
              size={20}
              color="#2563EB"
            />
          </View>

          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              Juan Dela Cruz
            </Text>

            <Text style={styles.accountEmail}>
              juan@email.com
            </Text>

            <View style={styles.verifiedRow}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#16A34A"
              />

              <Text style={styles.verifiedText}>
                Verified Participant
              </Text>
            </View>
          </View>
        </View>

        {/* TRAINING DETAILS */}

        <Text style={styles.sectionTitle}>
          Training Details
        </Text>

        <View style={styles.detailsCard}>
          <Detail
            icon="calendar-outline"
            label="Schedule"
            value={training.schedule}
          />

          <Detail
            icon="location-outline"
            label="Location"
            value={training.location}
          />

          <Detail
            icon="person-outline"
            label="Trainer"
            value={training.trainer}
          />
        </View>

        {/* DOCUMENTS */}

        <Text style={styles.sectionTitle}>
          Required Documents
        </Text>

        <Text style={styles.documentDescription}>
          Upload clear and readable copies of
          the required documents.
        </Text>

        <DocumentUpload
          icon="card-outline"
          title="Valid Government ID"
          description="Passport, Driver's License, National ID, etc."
          document={
            documents.validId
          }
          onPress={() =>
            mockUpload(
              "validId",
              "Valid-ID"
            )
          }
        />

        <DocumentUpload
          icon="home-outline"
          title="Proof of Address"
          description="Barangay Certificate, Utility Bill, etc."
          document={
            documents.proofOfAddress
          }
          onPress={() =>
            mockUpload(
              "proofOfAddress",
              "Proof-of-Address"
            )
          }
        />

        <DocumentUpload
          icon="document-text-outline"
          title="Supporting Document"
          description="Training-related certificate or supporting document."
          document={
            documents.supportingDocument
          }
          onPress={() =>
            mockUpload(
              "supportingDocument",
              "Supporting-Document"
            )
          }
        />

        {/* NOTICE */}

        <View style={styles.noticeCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.noticeText}>
            Your documents will be reviewed
            by an administrator before your
            enrollment is approved.
          </Text>
        </View>

        {/* SUBMIT */}

        <Pressable
          style={[
            styles.submitButton,
            (!allUploaded ||
              submitting) &&
              styles.submitDisabled,
          ]}
          disabled={
            !allUploaded ||
            submitting
          }
          onPress={handleSubmit}
        >
          <Ionicons
            name={
              submitting
                ? "hourglass-outline"
                : "send-outline"
            }
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.submitText}>
            {submitting
              ? "Submitting..."
              : "Submit Enrollment"}
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          By submitting this enrollment, you
          confirm that the information and
          documents provided are accurate.
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =====================================================
   DETAIL
===================================================== */

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =====================================================
   DOCUMENT
===================================================== */

function DocumentUpload({
  icon,
  title,
  description,
  document,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  document?: UploadedDocument;
  onPress: () => void;
}) {
  const uploaded = Boolean(document);

  return (
    <View style={styles.documentCard}>
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
              : icon
          }
          size={21}
          color={
            uploaded
              ? "#16A34A"
              : "#2563EB"
          }
        />
      </View>

      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>
          {title}
        </Text>

        <Text style={styles.documentDescription}>
          {uploaded
            ? document?.name
            : description}
        </Text>
      </View>

      <Pressable
        style={[
          styles.uploadButton,
          uploaded &&
            styles.uploadedButton,
        ]}
        onPress={onPress}
      >
        <Ionicons
          name={
            uploaded
              ? "checkmark"
              : "cloud-upload-outline"
          }
          size={16}
          color={
            uploaded
              ? "#16A34A"
              : "#2563EB"
          }
        />

        <Text
          style={[
            styles.uploadButtonText,
            uploaded &&
              styles.uploadedButtonText,
          ]}
        >
          {uploaded
            ? "Uploaded"
            : "Upload"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 110,
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
    marginBottom: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 23,
  },

  trainingCard: {
    backgroundColor: "#2563EB",
    borderRadius: 21,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  trainingIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  trainingInfo: {
    flex: 1,
  },

  trainingLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#BFDBFE",
    letterSpacing: 1,
  },

  trainingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 3,
  },

  trainingTrainer: {
    fontSize: 9,
    color: "#DBEAFE",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 11,
  },

  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  accountIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  accountEmail: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  verifiedText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#16A34A",
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
    marginBottom: 25,
    gap: 15,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailInfo: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginTop: 3,
  },

  documentDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#94A3B8",
    marginTop: -5,
    marginBottom: 12,
  },

  documentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  documentIconUploaded: {
    backgroundColor: "#DCFCE7",
  },

  documentInfo: {
    flex: 1,
  },

  documentTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },



  uploadButton: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  uploadedButton: {
    backgroundColor: "#DCFCE7",
  },

  uploadButtonText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
  },

  uploadedButtonText: {
    color: "#16A34A",
  },

  noticeCard: {
    marginTop: 15,
    backgroundColor: "#EFF6FF",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noticeText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#1D4ED8",
    marginLeft: 8,
  },

  submitButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },

  submitDisabled: {
    backgroundColor: "#94A3B8",
  },

  submitText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  footerText: {
    textAlign: "center",
    fontSize: 8,
    lineHeight: 13,
    color: "#94A3B8",
    marginTop: 12,
  },

  bottomSpace: {
    height: 25,
  },
});