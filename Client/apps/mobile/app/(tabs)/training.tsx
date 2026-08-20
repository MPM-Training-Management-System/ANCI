import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

// ============================================================
// TYPES
// ============================================================

type EnrollmentStatus =
  | "Available"
  | "Pending"
  | "Enrolled"
  | "Completed";

type TrainingStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed";

type Training = {
  id: string;
  code: string;
  title: string;
  description: string;
  trainer: string;
  duration: string;
  schedule: string;
  location: string;
  capacity: number;
  enrolled: number;

  status: TrainingStatus;
  enrollmentStatus: EnrollmentStatus;

  progress: number;

  assessment: boolean;
  exam: boolean;
};

// ============================================================
// MOCK DATA
// ============================================================

const INITIAL_TRAININGS: Training[] = [
  {
    id: "TRN-001",
    code: "TRN-2026-001",
    title: "Leadership Training",
    description:
      "Develop leadership, communication, decision-making, and teamwork skills through structured training sessions.",
    trainer: "Maria Santos",
    duration: "3 Weeks",
    schedule: "August 12 – August 30, 2026",
    location: "Training Center",
    capacity: 30,
    enrolled: 24,
    status: "Ongoing",
    enrollmentStatus: "Enrolled",
    progress: 72,
    assessment: true,
    exam: true,
  },

  {
    id: "TRN-002",
    code: "TRN-2026-002",
    title: "Team Development",
    description:
      "Improve collaboration, teamwork, communication, and group problem-solving skills.",
    trainer: "Daniel Cruz",
    duration: "2 Weeks",
    schedule: "September 08 – September 22, 2026",
    location: "Training Hall",
    capacity: 25,
    enrolled: 18,
    status: "Upcoming",
    enrollmentStatus: "Available",
    progress: 0,
    assessment: true,
    exam: true,
  },

  {
    id: "TRN-003",
    code: "TRN-2026-003",
    title: "Communication Skills",
    description:
      "Build effective verbal and written communication skills for professional environments.",
    trainer: "Maria Santos",
    duration: "2 Weeks",
    schedule: "October 05 – October 19, 2026",
    location: "Training Center",
    capacity: 30,
    enrolled: 12,
    status: "Upcoming",
    enrollmentStatus: "Available",
    progress: 0,
    assessment: true,
    exam: true,
  },

  {
    id: "TRN-004",
    code: "TRN-2026-004",
    title: "Basic Training",
    description:
      "Foundation training covering essential workplace knowledge, responsibilities, and procedures.",
    trainer: "Carlos Reyes",
    duration: "2 Weeks",
    schedule: "July 15 – July 29, 2026",
    location: "Training Center",
    capacity: 30,
    enrolled: 30,
    status: "Completed",
    enrollmentStatus: "Completed",
    progress: 100,
    assessment: true,
    exam: true,
  },
];

// ============================================================
// MAIN SCREEN
// ============================================================

export default function TrainingScreen() {
  const [trainings, setTrainings] = useState(
    INITIAL_TRAININGS,
  );

  const [selectedTraining, setSelectedTraining] =
    useState<Training | null>(null);

  const [showEnrollment, setShowEnrollment] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  // ==========================================================
  // CURRENT TRAINING
  // ==========================================================

  const currentTraining = useMemo(() => {
    return trainings.find(
      (training) =>
        training.status === "Ongoing" &&
        training.enrollmentStatus === "Enrolled",
    );
  }, [trainings]);

  // ==========================================================
  // AVAILABLE TRAINING
  // ==========================================================

  const availableTrainings = useMemo(() => {
    return trainings.filter(
      (training) =>
        training.status === "Upcoming" &&
        training.enrollmentStatus === "Available",
    );
  }, [trainings]);

  // ==========================================================
  // PENDING ENROLLMENT
  // ==========================================================

  const pendingTrainings = useMemo(() => {
    return trainings.filter(
      (training) =>
        training.enrollmentStatus === "Pending",
    );
  }, [trainings]);

  // ==========================================================
  // COMPLETED TRAINING
  // ==========================================================

  const completedTrainings = useMemo(() => {
    return trainings.filter(
      (training) =>
        training.status === "Completed",
    );
  }, [trainings]);

  // ==========================================================
  // OPEN ENROLLMENT
  // ==========================================================

  function openEnrollment(training: Training) {
    setSelectedTraining(training);
    setShowEnrollment(true);
  }

  // ==========================================================
  // SUBMIT ENROLLMENT
  // ==========================================================

  function submitEnrollment() {
    if (!selectedTraining) {
      return;
    }

    const trainingId = selectedTraining.id;

    setTrainings((current) =>
      current.map((training) =>
        training.id === trainingId
          ? {
              ...training,
              enrollmentStatus: "Pending",
            }
          : training,
      ),
    );

    setShowEnrollment(false);

    Alert.alert(
      "Enrollment Submitted",
      "Your enrollment request has been submitted and is now waiting for administrator review.",
    );
  }

  // ==========================================================
  // OPEN DETAILS
  // ==========================================================

  function openDetails(training: Training) {
    setSelectedTraining(training);
    setShowDetails(true);
  }

  // ==========================================================
  // ASSESSMENT
  // ==========================================================

  function openAssessment() {
    Alert.alert(
      "Assessment",
      "Mock Assessment screen. This will later connect to the assessment assigned by the trainer.",
    );
  }

  // ==========================================================
  // EXAM
  // ==========================================================

  function openExam() {
    Alert.alert(
      "Final Examination",
      "Mock Final Exam screen. The participant can take the exam once the required training conditions are satisfied.",
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              My Training
            </Text>

            <Text style={styles.subtitle}>
              Manage your training enrollment,
              assessment, and examination.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="school-outline"
              size={23}
              color="#2563EB"
            />
          </View>
        </View>

        {/* ==================================================
            CURRENT TRAINING
        ================================================== */}

        {currentTraining && (
          <>
            <SectionHeader
              title="Current Training"
              subtitle="Your active training program."
            />

            <CurrentTrainingCard
              training={currentTraining}
              onDetails={() =>
                openDetails(currentTraining)
              }
              onAssessment={openAssessment}
              onExam={openExam}
            />
          </>
        )}

        {/* ==================================================
            AVAILABLE TRAINING
        ================================================== */}

        {availableTrainings.length > 0 && (
          <>
            <View style={styles.sectionSpacing}>
              <SectionHeader
                title="Available Training"
                subtitle="Enroll in a training program."
              />
            </View>

            {availableTrainings.map(
              (training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  onDetails={() =>
                    openDetails(training)
                  }
                  onEnroll={() =>
                    openEnrollment(training)
                  }
                />
              ),
            )}
          </>
        )}

        {/* ==================================================
            PENDING
        ================================================== */}

        {pendingTrainings.length > 0 && (
          <>
            <View style={styles.sectionSpacing}>
              <SectionHeader
                title="Enrollment Requests"
                subtitle="Training applications awaiting review."
              />
            </View>

            {pendingTrainings.map(
              (training) => (
                <PendingCard
                  key={training.id}
                  training={training}
                  onPress={() =>
                    openDetails(training)
                  }
                />
              ),
            )}
          </>
        )}

        {/* ==================================================
            COMPLETED
        ================================================== */}

        {completedTrainings.length > 0 && (
          <>
            <View style={styles.sectionSpacing}>
              <SectionHeader
                title="Completed Training"
                subtitle="Your completed programs."
              />
            </View>

            {completedTrainings.map(
              (training) => (
                <CompletedCard
                  key={training.id}
                  training={training}
                  onPress={() =>
                    openDetails(training)
                  }
                />
              ),
            )}
          </>
        )}

        {/* ==================================================
            TRAINING FLOW
        ================================================== */}

        <View style={styles.flowCard}>
          <View style={styles.flowHeader}>
            <View style={styles.flowHeaderIcon}>
              <Ionicons
                name="git-branch-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={styles.flowHeaderInfo}>
              <Text style={styles.flowTitle}>
                Training Flow
              </Text>

              <Text style={styles.flowSubtitle}>
                Your participant journey.
              </Text>
            </View>
          </View>

          <View style={styles.flowSteps}>
            <FlowStep
              number="1"
              icon="school-outline"
              title="Enrollment"
              text="Apply for training"
            />

            <FlowConnector />

            <FlowStep
              number="2"
              icon="clipboard-outline"
              title="Assessment"
              text="Complete assessment"
            />

            <FlowConnector />

            <FlowStep
              number="3"
              icon="document-text-outline"
              title="Exam"
              text="Take final exam"
            />

            <FlowConnector />

            <FlowStep
              number="4"
              icon="ribbon-outline"
              title="Certificate"
              text="After qualification"
            />
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ====================================================
          ENROLLMENT MODAL
      ==================================================== */}

      <Modal
        visible={showEnrollment}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEnrollment(false)
        }
      >
        {selectedTraining && (
          <EnrollmentModal
            training={selectedTraining}
            onClose={() =>
              setShowEnrollment(false)
            }
            onSubmit={submitEnrollment}
          />
        )}
      </Modal>

      {/* ====================================================
          DETAILS MODAL
      ==================================================== */}

      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowDetails(false)
        }
      >
        {selectedTraining && (
          <DetailsModal
            training={selectedTraining}
            onClose={() =>
              setShowDetails(false)
            }
            onAssessment={openAssessment}
            onExam={openExam}
          />
        )}
      </Modal>
    </View>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

// ============================================================
// CURRENT TRAINING CARD
// ============================================================

function CurrentTrainingCard({
  training,
  onDetails,
  onAssessment,
  onExam,
}: {
  training: Training;
  onDetails: () => void;
  onAssessment: () => void;
  onExam: () => void;
}) {
  return (
    <View style={styles.currentCard}>
      <View style={styles.currentTop}>
        <View style={styles.currentIcon}>
          <Ionicons
            name="school"
            size={26}
            color="#2563EB"
          />
        </View>

        <View style={styles.ongoingBadge}>
          <View style={styles.greenDot} />

          <Text style={styles.ongoingText}>
            ONGOING
          </Text>
        </View>
      </View>

      <Text style={styles.currentTitle}>
        {training.title}
      </Text>

      <Text
        style={styles.currentDescription}
        numberOfLines={2}
      >
        {training.description}
      </Text>

      {/* TRAINER */}

      <View style={styles.trainerRow}>
        <View style={styles.trainerAvatar}>
          <Ionicons
            name="person"
            size={14}
            color="#FFFFFF"
          />
        </View>

        <View>
          <Text style={styles.smallLabel}>
            TRAINER
          </Text>

          <Text style={styles.trainerName}>
            {training.trainer}
          </Text>
        </View>
      </View>

      {/* PROGRESS */}

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Training Progress
        </Text>

        <Text style={styles.progressValue}>
          {training.progress}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${training.progress}%`,
            },
          ]}
        />
      </View>

      {/* ACTIONS */}

      <View style={styles.actionGrid}>
        <ActionButton
          icon="clipboard-outline"
          title="Assessment"
          subtitle="Open"
          onPress={onAssessment}
        />

        <ActionButton
          icon="document-text-outline"
          title="Exam"
          subtitle="Final"
          onPress={onExam}
        />

        <ActionButton
          icon="information-circle-outline"
          title="Details"
          subtitle="View"
          onPress={onDetails}
        />
      </View>
    </View>
  );
}

// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.menuPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Text style={styles.actionSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

// ============================================================
// TRAINING CARD
// ============================================================

function TrainingCard({
  training,
  onDetails,
  onEnroll,
}: {
  training: Training;
  onDetails: () => void;
  onEnroll: () => void;
}) {
  const remaining =
    training.capacity - training.enrolled;

  return (
    <View style={styles.trainingCard}>
      <View style={styles.trainingTop}>
        <View style={styles.trainingIcon}>
          <Ionicons
            name="school-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View style={styles.availableBadge}>
          <View style={styles.availableDot} />

          <Text style={styles.availableText}>
            AVAILABLE
          </Text>
        </View>
      </View>

      <Text style={styles.trainingTitle}>
        {training.title}
      </Text>

      <Text
        style={styles.trainingDescription}
        numberOfLines={2}
      >
        {training.description}
      </Text>

      <InfoRow
        icon="person-outline"
        text={training.trainer}
      />

      <InfoRow
        icon="calendar-outline"
        text={training.schedule}
      />

      <InfoRow
        icon="location-outline"
        text={training.location}
      />

      <InfoRow
        icon="time-outline"
        text={training.duration}
      />

      <View style={styles.capacityRow}>
        <View style={styles.capacityLeft}>
          <Ionicons
            name="people-outline"
            size={14}
            color="#64748B"
          />

          <Text style={styles.capacityText}>
            {remaining} slots remaining
          </Text>
        </View>

        <Text style={styles.capacityNumber}>
          {training.enrolled}/
          {training.capacity}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          style={styles.detailsButton}
          onPress={onDetails}
        >
          <Text
            style={styles.detailsButtonText}
          >
            Details
          </Text>
        </Pressable>

        <Pressable
          style={styles.enrollButton}
          onPress={onEnroll}
        >
          <Ionicons
            name="add-circle-outline"
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.enrollText}>
            Enroll
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={14}
        color="#64748B"
      />

      <Text style={styles.infoRowText}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// PENDING CARD
// ============================================================

function PendingCard({
  training,
  onPress,
}: {
  training: Training;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pendingCard,
        pressed && styles.menuPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.pendingIcon}>
        <Ionicons
          name="time-outline"
          size={22}
          color="#D97706"
        />
      </View>

      <View style={styles.pendingInfo}>
        <Text style={styles.pendingTitle}>
          {training.title}
        </Text>

        <Text style={styles.pendingDescription}>
          Enrollment is waiting for admin review.
        </Text>
      </View>

      <View style={styles.pendingBadge}>
        <Text style={styles.pendingBadgeText}>
          PENDING
        </Text>
      </View>
    </Pressable>
  );
}

// ============================================================
// COMPLETED CARD
// ============================================================

function CompletedCard({
  training,
  onPress,
}: {
  training: Training;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.completedCard,
        pressed && styles.menuPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.completedIcon}>
        <Ionicons
          name="checkmark-circle"
          size={25}
          color="#16A34A"
        />
      </View>

      <View style={styles.completedInfo}>
        <Text style={styles.completedTitle}>
          {training.title}
        </Text>

        <Text style={styles.completedDate}>
          {training.schedule}
        </Text>

        <Text style={styles.completedTrainer}>
          Trainer: {training.trainer}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

// ============================================================
// FLOW STEP
// ============================================================

function FlowStep({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.flowStep}>
      <View style={styles.flowNumber}>
        <Text style={styles.flowNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.flowStepIcon}>
        <Ionicons
          name={icon}
          size={17}
          color="#2563EB"
        />
      </View>

      <Text style={styles.flowStepTitle}>
        {title}
      </Text>

      <Text style={styles.flowStepText}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// FLOW CONNECTOR
// ============================================================

function FlowConnector() {
  return (
    <View style={styles.flowConnector} />
  );
}

// ============================================================
// ENROLLMENT MODAL
// ============================================================

function EnrollmentModal({
  training,
  onClose,
  onSubmit,
}: {
  training: Training;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.enrollmentModal}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>
              Enrollment
            </Text>

            <Text style={styles.modalSubtitle}>
              Apply for this training.
            </Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={20}
              color="#0F172A"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={
            styles.modalContent
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* TRAINING */}

          <View style={styles.enrollmentTraining}>
            <View
              style={
                styles.enrollmentTrainingIcon
              }
            >
              <Ionicons
                name="school"
                size={24}
                color="#2563EB"
              />
            </View>

            <View style={styles.trainingInfo}>
              <Text
                style={
                  styles.enrollmentTrainingTitle
                }
              >
                {training.title}
              </Text>

              <Text
                style={
                  styles.enrollmentTrainingCode
                }
              >
                {training.code}
              </Text>
            </View>
          </View>

          {/* REQUIREMENTS */}

          <Text style={styles.modalSectionTitle}>
            Enrollment Requirements
          </Text>

          <Requirement
            icon="person-outline"
            title="Verified Participant Account"
            text="Your participant account must be verified."
          />

          <Requirement
            icon="document-outline"
            title="Required Documents"
            text="Upload the documents required by the administrator."
          />

          <Requirement
            icon="checkmark-circle-outline"
            title="Eligibility"
            text="You must meet the eligibility requirements."
          />

          {/* DOCUMENTS */}

          <Text
            style={[
              styles.modalSectionTitle,
              {
                marginTop: 20,
              },
            ]}
          >
            Required Documents
          </Text>

          <DocumentItem
            title="Valid ID"
            required
          />

          <DocumentItem
            title="Proof of Eligibility"
            required
          />

          <DocumentItem
            title="Additional Document"
          />

          {/* NOTICE */}

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2563EB"
            />

            <Text style={styles.noticeText}>
              Your application will be reviewed
              by the administrator after
              submission.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text
              style={styles.cancelButtonText}
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={styles.submitButton}
            onPress={onSubmit}
          >
            <Ionicons
              name="paper-plane-outline"
              size={16}
              color="#FFFFFF"
            />

            <Text style={styles.submitText}>
              Submit Enrollment
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// REQUIREMENT
// ============================================================

function Requirement({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.requirement}>
      <View style={styles.requirementIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#2563EB"
        />
      </View>

      <View style={styles.requirementInfo}>
        <Text style={styles.requirementTitle}>
          {title}
        </Text>

        <Text style={styles.requirementText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// DOCUMENT ITEM
// ============================================================

function DocumentItem({
  title,
  required,
}: {
  title: string;
  required?: boolean;
}) {
  return (
    <Pressable
      style={styles.documentItem}
      onPress={() =>
        Alert.alert(
          "Upload Document",
          `${title} upload is currently mock only.`,
        )
      }
    >
      <View style={styles.documentIcon}>
        <Ionicons
          name="document-outline"
          size={20}
          color="#2563EB"
        />
      </View>

      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>
          {title}
        </Text>

        <Text style={styles.documentSubtitle}>
          {required
            ? "Required • Tap to upload"
            : "Optional • Tap to upload"}
        </Text>
      </View>

      <Ionicons
        name="cloud-upload-outline"
        size={20}
        color="#2563EB"
      />
    </Pressable>
  );
}

// ============================================================
// DETAILS MODAL
// ============================================================

function DetailsModal({
  training,
  onClose,
  onAssessment,
  onExam,
}: {
  training: Training;
  onClose: () => void;
  onAssessment: () => void;
  onExam: () => void;
}) {
  const isEnrolled =
    training.enrollmentStatus === "Enrolled";

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.detailsModal}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>
              Training Details
            </Text>

            <Text style={styles.modalSubtitle}>
              {training.code}
            </Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={20}
              color="#0F172A"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={
            styles.detailsContent
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* HERO */}

          <View style={styles.detailsHero}>
            <View style={styles.detailsHeroIcon}>
              <Ionicons
                name="school"
                size={29}
                color="#2563EB"
              />
            </View>

            <Text style={styles.detailsTitle}>
              {training.title}
            </Text>

            <Text
              style={styles.detailsDescription}
            >
              {training.description}
            </Text>

            <View style={styles.detailsStatus}>
              <View style={styles.greenDot} />

              <Text
                style={styles.detailsStatusText}
              >
                {training.status}
              </Text>
            </View>
          </View>

          {/* TRAINER */}

          <View style={styles.detailsTrainer}>
            <View
              style={styles.detailsTrainerAvatar}
            >
              <Ionicons
                name="person"
                size={16}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.smallLabel}>
                TRAINER
              </Text>

              <Text
                style={styles.detailsTrainerName}
              >
                {training.trainer}
              </Text>
            </View>
          </View>

          {/* INFO */}

          <Text style={styles.modalSectionTitle}>
            Training Information
          </Text>

          <View style={styles.detailsInfoCard}>
            <InfoRow
              icon="calendar-outline"
              text={training.schedule}
            />

            <InfoRow
              icon="time-outline"
              text={training.duration}
            />

            <InfoRow
              icon="location-outline"
              text={training.location}
            />

            <InfoRow
              icon="people-outline"
              text={`${training.enrolled}/${training.capacity} participants`}
            />
          </View>

          {/* ENROLLED FLOW */}

          {isEnrolled && (
            <>
              <Text
                style={[
                  styles.modalSectionTitle,
                  {
                    marginTop: 21,
                  },
                ]}
              >
                Training Progress
              </Text>

              <View style={styles.progressCard}>
                <View
                  style={styles.progressHeader}
                >
                  <Text
                    style={styles.progressLabel}
                  >
                    Overall Progress
                  </Text>

                  <Text
                    style={styles.progressValue}
                  >
                    {training.progress}%
                  </Text>
                </View>

                <View
                  style={styles.progressTrack}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${training.progress}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* ASSESSMENT */}

              <Text
                style={[
                  styles.modalSectionTitle,
                  {
                    marginTop: 21,
                  },
                ]}
              >
                Assessment & Exam
              </Text>

              <AssessmentExamItem
                icon="clipboard-outline"
                title="Assessment"
                subtitle="Training knowledge assessment"
                onPress={onAssessment}
              />

              <AssessmentExamItem
                icon="document-text-outline"
                title="Final Examination"
                subtitle="Final qualification exam"
                onPress={onExam}
              />

              {/* CERTIFICATE INFO */}

              <View style={styles.certificateNotice}>
                <Ionicons
                  name="ribbon-outline"
                  size={21}
                  color="#D97706"
                />

                <View
                  style={
                    styles.certificateNoticeInfo
                  }
                >
                  <Text
                    style={
                      styles.certificateNoticeTitle
                    }
                  >
                    Certificate
                  </Text>

                  <Text
                    style={
                      styles.certificateNoticeText
                    }
                  >
                    Your certificate will become
                    available after meeting the
                    qualification requirements.
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.modalBottomSpace} />
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================
// ASSESSMENT / EXAM ITEM
// ============================================================

function AssessmentExamItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.assessmentExamItem,
        pressed && styles.menuPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.assessmentExamIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View style={styles.assessmentExamInfo}>
        <Text
          style={styles.assessmentExamTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.assessmentExamSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // MAIN
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 140,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  headerInfo: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 5,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionHeader: {
    marginBottom: 12,
  },

  sectionSpacing: {
    marginTop: 29,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 3,
  },

  // ==========================================================
  // CURRENT CARD
  // ==========================================================

  currentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  currentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currentIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  ongoingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },

  ongoingText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#16A34A",
  },

  currentTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 15,
  },

  currentDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 5,
  },

  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  trainerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  smallLabel: {
    fontSize: 6,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  trainerName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 6,
  },

  progressLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  progressValue: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  progressTrack: {
    height: 7,
    borderRadius: 7,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: "#2563EB",
  },

  // ==========================================================
  // ACTIONS
  // ==========================================================

  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 91,
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
  },

  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 7,
  },

  actionSubtitle: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 2,
  },

  // ==========================================================
  // TRAINING
  // ==========================================================

  trainingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 11,
  },

  trainingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  trainingIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },

  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },

  availableText: {
    fontSize: 5,
    fontWeight: "800",
    color: "#16A34A",
  },

  trainingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 13,
  },

  trainingDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },

  infoRowText: {
    flex: 1,
    fontSize: 8,
    color: "#64748B",
  },

  capacityRow: {
    marginTop: 13,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  capacityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  capacityText: {
    fontSize: 8,
    color: "#64748B",
  },

  capacityNumber: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  detailsButton: {
    flex: 1,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsButtonText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#475569",
  },

  enrollButton: {
    flex: 1.3,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  enrollText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // ==========================================================
  // PENDING
  // ==========================================================

  pendingCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  pendingIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  pendingInfo: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#78350F",
  },

  pendingDescription: {
    fontSize: 8,
    lineHeight: 13,
    color: "#92400E",
    marginTop: 3,
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 5,
  },

  pendingBadgeText: {
    fontSize: 5,
    fontWeight: "800",
    color: "#D97706",
  },

  // ==========================================================
  // COMPLETED
  // ==========================================================

  completedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  completedIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  completedInfo: {
    flex: 1,
  },

  completedTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  completedDate: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  completedTrainer: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 3,
  },

  // ==========================================================
  // FLOW
  // ==========================================================

  flowCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 15,
    marginTop: 20,
  },

  flowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  flowHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  flowHeaderInfo: {
    flex: 1,
  },

  flowTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  flowSubtitle: {
    fontSize: 8,
    color: "#2563EB",
    marginTop: 2,
  },

  flowSteps: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
  },

  flowStep: {
    flex: 1,
    alignItems: "center",
  },

  flowNumber: {
    position: "absolute",
    top: -5,
    right: 4,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  flowNumberText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  flowStepIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  flowStepTitle: {
    fontSize: 7,
    fontWeight: "800",
    color: "#1E3A8A",
    marginTop: 6,
    textAlign: "center",
  },

  flowStepText: {
    fontSize: 6,
    color: "#2563EB",
    marginTop: 2,
    textAlign: "center",
  },

  flowConnector: {
    width: 12,
    height: 1,
    backgroundColor: "#93C5FD",
    marginTop: 19,
  },

  bottomSpace: {
    height: 30,
  },

  // ==========================================================
  // FIX FOR menuPressed ERROR
  // ==========================================================

  menuPressed: {
    opacity: 0.72,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  enrollmentModal: {
    height: "88%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },

  detailsModal: {
    height: "90%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },

  modalHeader: {
    minHeight: 70,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    flex: 1,
  },

  modalContent: {
    padding: 20,
    paddingBottom: 35,
  },

  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },

  // ==========================================================
  // ENROLLMENT
  // ==========================================================

  enrollmentTraining: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  enrollmentTrainingIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trainingInfo: {
    flex: 1,
  },

  enrollmentTrainingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  enrollmentTrainingCode: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 3,
  },

  requirement: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    flexDirection: "row",
    marginBottom: 9,
  },

  requirementIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  requirementInfo: {
    flex: 1,
  },

  requirementTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  requirementText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
    marginTop: 3,
  },

  documentItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  documentInfo: {
    flex: 1,
  },

  documentTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  documentSubtitle: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 3,
  },

  notice: {
    backgroundColor: "#EFF6FF",
    borderRadius: 15,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noticeText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: "#2563EB",
    marginLeft: 8,
  },

  // ==========================================================
  // MODAL ACTIONS
  // ==========================================================

  modalActions: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    gap: 9,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#475569",
  },

  submitButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  submitText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  detailsContent: {
    padding: 20,
    paddingBottom: 40,
  },

  detailsHero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 19,
    alignItems: "center",
  },

  detailsHeroIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 12,
  },

  detailsDescription: {
    fontSize: 9,
    lineHeight: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 5,
  },

  detailsStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 11,
  },

  detailsStatusText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#16A34A",
  },

  detailsTrainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  detailsTrainerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailsTrainerName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },

  detailsInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 10,
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },

  assessmentExamItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  assessmentExamIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  assessmentExamInfo: {
    flex: 1,
  },

  assessmentExamTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  assessmentExamSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  certificateNotice: {
    backgroundColor: "#FFFBEB",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 13,
    flexDirection: "row",
    marginTop: 8,
  },

  certificateNoticeInfo: {
    flex: 1,
    marginLeft: 9,
  },

  certificateNoticeTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
  },

  certificateNoticeText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#A16207",
    marginTop: 3,
  },

  modalBottomSpace: {
    height: 20,
  },
});