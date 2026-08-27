import React, {
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  ParticipantTraining,
} from "@/src/data/participantTraining";

export interface EnrollmentFormData {
  participantName: string;
  email: string;
  mobileNumber: string;
  mode: ParticipantTraining["mode"];
}

interface Props {
  training: ParticipantTraining;

  initialData: EnrollmentFormData;

  onBack: () => void;

  onContinue: (
    data: EnrollmentFormData
  ) => void;
}

export default function EnrollmentForm({
  training,
  initialData,
  onBack,
  onContinue,
}: Props) {
  const [
    participantName,
    setParticipantName,
  ] = useState(
    initialData.participantName
  );

  const [
    email,
    setEmail,
  ] = useState(
    initialData.email
  );

  const [
    mobileNumber,
    setMobileNumber,
  ] = useState(
    initialData.mobileNumber
  );

  const [
    mode,
    setMode,
  ] = useState<
    ParticipantTraining["mode"]
  >(initialData.mode);

  const handleContinue = () => {
    onContinue({
      participantName:
        participantName.trim(),

      email:
        email.trim(),

      mobileNumber:
        mobileNumber.trim(),

      mode,
    });
  };

  const canContinue =
    participantName.trim().length > 0 &&
    email.trim().length > 0 &&
    mobileNumber.trim().length > 0;

  return (
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.step}>
              STEP 1 OF 2
            </Text>

            <Text style={styles.title}>
              Enrollment
            </Text>

            <Text style={styles.subtitle}>
              Provide your participant
              information.
            </Text>
          </View>
        </View>

        <View style={styles.trainingCard}>
          <View style={styles.trainingIcon}>
            <Ionicons
              name="school-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View style={styles.trainingContent}>
            <Text style={styles.trainingLabel}>
              TRAINING PROGRAM
            </Text>

            <Text style={styles.trainingTitle}>
              {training.title}
            </Text>

            <Text style={styles.trainingCode}>
              {training.code}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participant Information
          </Text>

          <Input
            label="FULL NAME"
            placeholder="Enter your full name"
            value={participantName}
            onChangeText={
              setParticipantName
            }
            icon="person-outline"
          />

          <Input
            label="EMAIL ADDRESS"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <Input
            label="MOBILE NUMBER"
            placeholder="09XXXXXXXXX"
            value={mobileNumber}
            onChangeText={
              setMobileNumber
            }
            keyboardType="phone-pad"
            icon="call-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Training Mode
          </Text>

          <Text style={styles.helper}>
            Select how you prefer to attend
            the training.
          </Text>

          <ModeOption
            icon="videocam-outline"
            title="Online"
            description="Attend sessions remotely."
            selected={
              mode === "Online"
            }
            onPress={() =>
              setMode("Online")
            }
          />

          <ModeOption
            icon="business-outline"
            title="Face-to-Face"
            description="Attend sessions at the training center."
            selected={
              mode === "Face-to-Face"
            }
            onPress={() =>
              setMode("Face-to-Face")
            }
          />

          <ModeOption
            icon="git-compare-outline"
            title="Hybrid"
            description="Combination of online and face-to-face sessions."
            selected={
              mode === "Hybrid"
            }
            onPress={() =>
              setMode("Hybrid")
            }
          />
        </View>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.noticeText}>
            Make sure your information is
            correct before continuing. Your
            application will be reviewed by
            the administrator.
          </Text>
        </View>

        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !canContinue &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name={icon}
          size={17}
          color="#94A3B8"
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={
            autoCapitalize
          }
        />
      </View>
    </View>
  );
}

function ModeOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.modeOption,
        selected &&
          styles.modeOptionSelected,
      ]}
    >
      <View
        style={[
          styles.modeIcon,
          selected &&
            styles.modeIconSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            selected
              ? "#2563EB"
              : "#64748B"
          }
        />
      </View>

      <View style={styles.modeContent}>
        <Text style={styles.modeTitle}>
          {title}
        </Text>

        <Text
          style={styles.modeDescription}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name={
          selected
            ? "checkmark-circle"
            : "ellipse-outline"
        }
        size={21}
        color={
          selected
            ? "#2563EB"
            : "#CBD5E1"
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    
  },

  content: {
    padding: 20,
    paddingBottom: 90,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    marginLeft: 12,
  },

  step: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 3,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 8,
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
    width: 43,
    height: 43,
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
    marginTop: 2,
    fontSize: 6,
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

  helper: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 8,
    color: "#94A3B8",
  },

  inputGroup: {
    marginTop: 14,
  },

  inputLabel: {
    marginBottom: 6,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#64748B",
  },

  inputWrapper: {
    height: 50,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 10,
    color: "#0F172A",
  },

  modeOption: {
    marginBottom: 9,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  modeOptionSelected: {
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },

  modeIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  modeIconSelected: {
    backgroundColor: "#DBEAFE",
  },

  modeContent: {
    flex: 1,
    marginLeft: 9,
  },

  modeTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#334155",
  },

  modeDescription: {
    marginTop: 3,
    fontSize: 7,
    color: "#94A3B8",
  },

  notice: {
    marginTop: 20,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    gap: 8,
  },

  noticeText: {
    flex: 1,
    fontSize: 7,
    lineHeight: 12,
    color: "#475569",
  },

  continueButton: {
    height: 52,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  disabledButton: {
    backgroundColor: "#CBD5E1",
  },

  continueText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});