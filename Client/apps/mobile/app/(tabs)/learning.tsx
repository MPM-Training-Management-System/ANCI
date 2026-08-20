import React, { useMemo, useState } from "react";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

// ============================================================
// TYPES
// ============================================================

type MaterialType =
  | "chapter"
  | "video"
  | "document"
  | "practice";

type MaterialStatus =
  | "completed"
  | "in-progress"
  | "locked"
  | "available";

type Material = {
  id: string;
  title: string;
  subtitle: string;
  type: MaterialType;
  status: MaterialStatus;
  progress?: number;
  duration?: string;
  pages?: number;
  icon: keyof typeof Ionicons.glyphMap;
};

// ============================================================
// MOCK TRAINING
// ============================================================

const CURRENT_TRAINING = {
  id: "TRN-001",
  title: "Leadership Training",
  description:
    "Develop leadership, communication, teamwork, and decision-making skills.",
  trainer: "Maria Santos",
  schedule: "August 12 – August 30, 2026",
  location: "Training Center",
  progress: 72,
  completedModules: 3,
  totalModules: 5,
};

// ============================================================
// MOCK MATERIALS
// ============================================================

const MATERIALS: Material[] = [
  {
    id: "MAT-001",
    title: "Introduction to Leadership",
    subtitle: "Chapter 1 • Fundamentals",
    type: "chapter",
    status: "completed",
    progress: 100,
    pages: 12,
    icon: "book-outline",
  },

  {
    id: "MAT-002",
    title: "Leadership Principles",
    subtitle: "Chapter 2 • Core Principles",
    type: "chapter",
    status: "completed",
    progress: 100,
    pages: 15,
    icon: "book-outline",
  },

  {
    id: "MAT-003",
    title: "Effective Communication",
    subtitle: "Chapter 3 • Communication",
    type: "chapter",
    status: "completed",
    progress: 100,
    pages: 18,
    icon: "book-outline",
  },

  {
    id: "MAT-004",
    title: "Team Management",
    subtitle: "Chapter 4 • Current Lesson",
    type: "chapter",
    status: "in-progress",
    progress: 72,
    pages: 20,
    icon: "book-outline",
  },

  {
    id: "MAT-005",
    title: "Decision Making",
    subtitle: "Chapter 5 • Advanced Leadership",
    type: "chapter",
    status: "available",
    progress: 0,
    pages: 16,
    icon: "book-outline",
  },

  {
    id: "VID-001",
    title: "What Makes a Good Leader?",
    subtitle: "Training Video • 08:42",
    type: "video",
    status: "completed",
    progress: 100,
    duration: "08:42",
    icon: "play-circle-outline",
  },

  {
    id: "VID-002",
    title: "Building Effective Teams",
    subtitle: "Training Video • 12:15",
    type: "video",
    status: "available",
    progress: 0,
    duration: "12:15",
    icon: "play-circle-outline",
  },

  {
    id: "DOC-001",
    title: "Leadership Training Manual",
    subtitle: "PDF Document • 48 pages",
    type: "document",
    status: "available",
    pages: 48,
    icon: "document-text-outline",
  },

  {
    id: "DOC-002",
    title: "Communication Reference Guide",
    subtitle: "PDF Document • 22 pages",
    type: "document",
    status: "available",
    pages: 22,
    icon: "document-text-outline",
  },

  {
    id: "PRA-001",
    title: "Leadership Practice Activity",
    subtitle: "Practice Material • 10 questions",
    type: "practice",
    status: "available",
    progress: 0,
    icon: "create-outline",
  },
];

// ============================================================
// SCREEN
// ============================================================

export default function LearningScreen() {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<"all" | MaterialType>("all");

  const [selectedMaterial, setSelectedMaterial] =
    useState<Material | null>(null);

  const [readerVisible, setReaderVisible] =
    useState(false);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredMaterials = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return MATERIALS.filter((material) => {
      const matchesSearch =
        query.length === 0 ||
        material.title
          .toLowerCase()
          .includes(query) ||
        material.subtitle
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === "all" ||
        material.type === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [search, activeFilter]);

  // ==========================================================
  // OPEN MATERIAL
  // ==========================================================

  function openMaterial(material: Material) {
    if (material.status === "locked") {
      Alert.alert(
        "Material Locked",
        "Complete the previous training module before accessing this material.",
      );

      return;
    }

    setSelectedMaterial(material);
    setReaderVisible(true);
  }

  // ==========================================================
  // CONTINUE LEARNING
  // ==========================================================

  function continueLearning() {
    const currentMaterial =
      MATERIALS.find(
        (material) =>
          material.status === "in-progress",
      );

    if (!currentMaterial) {
      return;
    }

    openMaterial(currentMaterial);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              Learning
            </Text>

            <Text style={styles.subtitle}>
              Continue your training and learning
              materials.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="book-outline"
              size={23}
              color="#2563EB"
            />
          </View>
        </View>

        {/* ==================================================
            CURRENT TRAINING
        ================================================== */}

        <View style={styles.trainingCard}>
          <View style={styles.trainingTop}>
            <View style={styles.trainingIcon}>
              <Ionicons
                name="school-outline"
                size={23}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.trainingInfo}>
              <Text style={styles.trainingLabel}>
                CURRENT TRAINING
              </Text>

              <Text style={styles.trainingTitle}>
                {CURRENT_TRAINING.title}
              </Text>

              <Text style={styles.trainingTrainer}>
                Trainer: {CURRENT_TRAINING.trainer}
              </Text>
            </View>
          </View>

          <View style={styles.trainingProgressHeader}>
            <Text
              style={styles.trainingProgressLabel}
            >
              Overall Progress
            </Text>

            <Text
              style={styles.trainingProgressValue}
            >
              {CURRENT_TRAINING.progress}%
            </Text>
          </View>

          <View style={styles.trainingProgressTrack}>
            <View
              style={[
                styles.trainingProgressFill,
                {
                  width: `${CURRENT_TRAINING.progress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.trainingFooter}>
            <View style={styles.trainingStat}>
              <Ionicons
                name="layers-outline"
                size={13}
                color="#DBEAFE"
              />

              <Text style={styles.trainingStatText}>
                {CURRENT_TRAINING.completedModules} of{" "}
                {CURRENT_TRAINING.totalModules} modules
              </Text>
            </View>

            <View style={styles.trainingStat}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#DBEAFE"
              />

              <Text style={styles.trainingStatText}>
                Aug 12 – Aug 30
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            CONTINUE READING
        ================================================== */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Continue Reading
            </Text>

            <Text style={styles.sectionSubtitle}>
              Pick up where you left off.
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueCard,
            pressed && styles.pressed,
          ]}
          onPress={continueLearning}
        >
          <View style={styles.continueIcon}>
            <Ionicons
              name="book"
              size={25}
              color="#2563EB"
            />
          </View>

          <View style={styles.continueInfo}>
            <Text style={styles.continueLabel}>
              LAST READ
            </Text>

            <Text style={styles.continueTitle}>
              Team Management
            </Text>

            <Text style={styles.continueSubtitle}>
              Chapter 4 • Page 14 of 20
            </Text>

            <View
              style={styles.continueProgressTrack}
            >
              <View
                style={[
                  styles.continueProgressFill,
                  {
                    width: "72%",
                  },
                ]}
              />
            </View>

            <Text style={styles.continueProgressText}>
              72% completed
            </Text>
          </View>

          <View style={styles.continueArrow}>
            <Ionicons
              name="chevron-forward"
              size={19}
              color="#2563EB"
            />
          </View>
        </Pressable>

        {/* ==================================================
            QUICK LEARNING STATS
        ================================================== */}

        <View style={styles.statsRow}>
          <LearningStat
            icon="book-outline"
            value="5"
            label="Chapters"
          />

          <LearningStat
            icon="play-circle-outline"
            value="2"
            label="Videos"
          />

          <LearningStat
            icon="document-text-outline"
            value="2"
            label="Documents"
          />
        </View>

        {/* ==================================================
            MATERIALS HEADER
        ================================================== */}

        <View style={styles.materialHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              My Materials
            </Text>

            <Text style={styles.sectionSubtitle}>
              All materials for your current training.
            </Text>
          </View>

          <View style={styles.materialCount}>
            <Text style={styles.materialCountText}>
              {filteredMaterials.length}
            </Text>
          </View>
        </View>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#94A3B8"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search learning materials..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* ==================================================
            FILTER
        ================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          <FilterButton
            label="All"
            active={activeFilter === "all"}
            onPress={() =>
              setActiveFilter("all")
            }
          />

          <FilterButton
            label="Chapters"
            icon="book-outline"
            active={
              activeFilter === "chapter"
            }
            onPress={() =>
              setActiveFilter("chapter")
            }
          />

          <FilterButton
            label="Videos"
            icon="play-circle-outline"
            active={
              activeFilter === "video"
            }
            onPress={() =>
              setActiveFilter("video")
            }
          />

          <FilterButton
            label="Documents"
            icon="document-text-outline"
            active={
              activeFilter === "document"
            }
            onPress={() =>
              setActiveFilter("document")
            }
          />

          <FilterButton
            label="Practice"
            icon="create-outline"
            active={
              activeFilter === "practice"
            }
            onPress={() =>
              setActiveFilter("practice")
            }
          />
        </ScrollView>

        {/* ==================================================
            MATERIAL LIST
        ================================================== */}

        <View style={styles.materialList}>
          {filteredMaterials.map(
            (material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onPress={() =>
                  openMaterial(material)
                }
              />
            ),
          )}

          {filteredMaterials.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No materials found
              </Text>

              <Text style={styles.emptyText}>
                Try another search term or
                material category.
              </Text>
            </View>
          )}
        </View>

        {/* ==================================================
            ASSESSMENT
        ================================================== */}

        <View style={styles.assessmentSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Assessment
              </Text>

              <Text style={styles.sectionSubtitle}>
                Check your understanding.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.assessmentCard,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                "Assessment",
                "Assessment screen will be connected here.",
              )
            }
          >
            <View style={styles.assessmentIcon}>
              <Ionicons
                name="clipboard-outline"
                size={24}
                color="#7C3AED"
              />
            </View>

            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>
                Module Assessment
              </Text>

              <Text style={styles.assessmentSubtitle}>
                Leadership & Team Management
              </Text>

              <View style={styles.assessmentResult}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#16A34A"
                />

                <Text style={styles.assessmentResultText}>
                  Previous Score: 18 / 20
                </Text>
              </View>
            </View>

            <View style={styles.assessmentArrow}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#7C3AED"
              />
            </View>
          </Pressable>
        </View>

        {/* ==================================================
            FINAL EXAM
        ================================================== */}

        <View style={styles.examSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Final Exam
              </Text>

              <Text style={styles.sectionSubtitle}>
                Complete all required learning modules
                first.
              </Text>
            </View>
          </View>

          <View style={styles.examCard}>
            <View style={styles.examIcon}>
              <Ionicons
                name="trophy-outline"
                size={25}
                color="#D97706"
              />
            </View>

            <View style={styles.examInfo}>
              <Text style={styles.examTitle}>
                Final Training Examination
              </Text>

              <Text style={styles.examSubtitle}>
                50 questions • 60 minutes
              </Text>

              <View style={styles.examStatus}>
                <View style={styles.examStatusDot} />

                <Text style={styles.examStatusText}>
                  Not Started
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.examButton}
              onPress={() =>
                Alert.alert(
                  "Final Exam",
                  "The final exam will become available once all required learning modules are completed.",
                )
              }
            >
              <Text style={styles.examButtonText}>
                View
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ==================================================
            TRAINER NOTE
        ================================================== */}

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle}>
              Training Reminder
            </Text>

            <Text style={styles.noteText}>
              Complete your learning materials and
              required assessments before taking the
              final examination.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ====================================================
          READER MODAL
      ==================================================== */}

      <Modal
        visible={readerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() =>
          setReaderVisible(false)
        }
      >
        <ReaderModal
          material={selectedMaterial}
          onClose={() =>
            setReaderVisible(false)
          }
        />
      </Modal>
    </View>
  );
}

// ============================================================
// LEARNING STAT
// ============================================================

function LearningStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.learningStat}>
      <View style={styles.learningStatIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <Text style={styles.learningStatValue}>
        {value}
      </Text>

      <Text style={styles.learningStatLabel}>
        {label}
      </Text>
    </View>
  );
}

// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={13}
          color={
            active
              ? "#FFFFFF"
              : "#64748B"
          }
        />
      )}

      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ============================================================
// MATERIAL CARD
// ============================================================

function MaterialCard({
  material,
  onPress,
}: {
  material: Material;
  onPress: () => void;
}) {
  const isCompleted =
    material.status === "completed";

  const isInProgress =
    material.status === "in-progress";

  const isLocked =
    material.status === "locked";

  const iconBackground =
    material.type === "video"
      ? "#F3E8FF"
      : material.type === "document"
        ? "#FFF7ED"
        : material.type === "practice"
          ? "#ECFDF5"
          : "#EFF6FF";

  const iconColor =
    material.type === "video"
      ? "#7C3AED"
      : material.type === "document"
        ? "#EA580C"
        : material.type === "practice"
          ? "#059669"
          : "#2563EB";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.materialCard,
        pressed && styles.pressed,
        isLocked &&
          styles.materialCardLocked,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.materialIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={material.icon}
          size={22}
          color={
            isLocked
              ? "#94A3B8"
              : iconColor
          }
        />
      </View>

      <View style={styles.materialInfo}>
        <View style={styles.materialTitleRow}>
          <Text
            style={[
              styles.materialTitle,
              isLocked &&
                styles.materialTitleLocked,
            ]}
            numberOfLines={1}
          >
            {material.title}
          </Text>

          {isCompleted && (
            <Ionicons
              name="checkmark-circle"
              size={17}
              color="#16A34A"
            />
          )}

          {isLocked && (
            <Ionicons
              name="lock-closed"
              size={14}
              color="#94A3B8"
            />
          )}
        </View>

        <Text
          style={styles.materialSubtitle}
          numberOfLines={1}
        >
          {material.subtitle}
        </Text>

        {/* Progress */}

        {isInProgress &&
          material.progress !== undefined && (
            <View style={styles.materialProgress}>
              <View
                style={
                  styles.materialProgressTrack
                }
              >
                <View
                  style={[
                    styles.materialProgressFill,
                    {
                      width: `${material.progress}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={styles.materialProgressText}
              >
                {material.progress}%
              </Text>
            </View>
          )}

        {/* Metadata */}

        <View style={styles.materialMeta}>
          {material.type === "chapter" &&
            material.pages && (
              <Text
                style={styles.materialMetaText}
              >
                {material.pages} pages
              </Text>
            )}

          {material.type === "video" &&
            material.duration && (
              <Text
                style={styles.materialMetaText}
              >
                {material.duration}
              </Text>
            )}

          {material.type === "document" &&
            material.pages && (
              <Text
                style={styles.materialMetaText}
              >
                {material.pages} pages
              </Text>
            )}

          {material.type === "practice" && (
            <Text
              style={styles.materialMetaText}
            >
              Practice activity
            </Text>
          )}

          <MaterialStatus
            status={material.status}
          />
        </View>
      </View>

      <Ionicons
        name={
          isLocked
            ? "lock-closed-outline"
            : "chevron-forward"
        }
        size={17}
        color="#94A3B8"
      />
    </Pressable>
  );
}

// ============================================================
// MATERIAL STATUS
// ============================================================

function MaterialStatus({
  status,
}: {
  status: MaterialStatus;
}) {
  if (status === "completed") {
    return (
      <View
        style={[
          styles.materialStatus,
          styles.statusCompleted,
        ]}
      >
        <Text
          style={[
            styles.materialStatusText,
            {
              color: "#16A34A",
            },
          ]}
        >
          Completed
        </Text>
      </View>
    );
  }

  if (status === "in-progress") {
    return (
      <View
        style={[
          styles.materialStatus,
          styles.statusProgress,
        ]}
      >
        <Text
          style={[
            styles.materialStatusText,
            {
              color: "#2563EB",
            },
          ]}
        >
          In Progress
        </Text>
      </View>
    );
  }

  if (status === "locked") {
    return (
      <View
        style={[
          styles.materialStatus,
          styles.statusLocked,
        ]}
      >
        <Text
          style={[
            styles.materialStatusText,
            {
              color: "#64748B",
            },
          ]}
        >
          Locked
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.materialStatus,
        styles.statusAvailable,
      ]}
    >
      <Text
        style={[
          styles.materialStatusText,
          {
            color: "#7C3AED",
          },
        ]}
      >
        Available
      </Text>
    </View>
  );
}

// ============================================================
// READER MODAL
// ============================================================

function ReaderModal({
  material,
  onClose,
}: {
  material: Material | null;
  onClose: () => void;
}) {
  if (!material) {
    return null;
  }

  const isVideo =
    material.type === "video";

  const isDocument =
    material.type === "document";

  return (
    <View style={styles.readerContainer}>
      {/* ==================================================
          READER HEADER
      ================================================== */}

      <View style={styles.readerHeader}>
        <Pressable
          style={styles.readerBack}
          onPress={onClose}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.readerHeaderInfo}>
          <Text
            style={styles.readerHeaderLabel}
          >
            {isVideo
              ? "VIDEO"
              : isDocument
                ? "DOCUMENT"
                : "LEARNING MATERIAL"}
          </Text>

          <Text
            style={styles.readerHeaderTitle}
            numberOfLines={1}
          >
            {material.title}
          </Text>
        </View>

        <Pressable
          style={styles.readerBookmark}
          onPress={() =>
            Alert.alert(
              "Saved",
              "This material has been added to your bookmarks.",
            )
          }
        >
          <Ionicons
            name="bookmark-outline"
            size={20}
            color="#2563EB"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.readerContent
        }
      >
        {/* ==================================================
            MATERIAL HERO
        ================================================== */}

        <View style={styles.readerHero}>
          <View style={styles.readerHeroIcon}>
            <Ionicons
              name={material.icon}
              size={34}
              color="#2563EB"
            />
          </View>

          <Text style={styles.readerTitle}>
            {material.title}
          </Text>

          <Text style={styles.readerSubtitle}>
            {material.subtitle}
          </Text>
        </View>

        {/* ==================================================
            VIDEO MOCK
        ================================================== */}

        {isVideo && (
          <Pressable
            style={styles.videoPlayer}
            onPress={() =>
              Alert.alert(
                "Video",
                "Mock video player.",
              )
            }
          >
            <View style={styles.videoPlay}>
              <Ionicons
                name="play"
                size={28}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.videoText}>
              Tap to play training video
            </Text>
          </Pressable>
        )}

        {/* ==================================================
            DOCUMENT / CHAPTER CONTENT
        ================================================== */}

        {!isVideo && (
          <View style={styles.article}>
            <Text style={styles.articleHeading}>
              Introduction
            </Text>

            <Text style={styles.articleText}>
              Leadership is the ability to guide,
              support, and influence individuals or
              teams toward a shared goal.
            </Text>

            <Text style={styles.articleText}>
              Effective leaders communicate clearly,
              understand their team members, make
              responsible decisions, and create an
              environment where people can contribute
              their strengths.
            </Text>

            <Text style={styles.articleHeading}>
              Key Learning Points
            </Text>

            <LearningPoint
              number="01"
              title="Communication"
              description="Communicate goals, expectations, and feedback clearly."
            />

            <LearningPoint
              number="02"
              title="Teamwork"
              description="Build trust and encourage collaboration among team members."
            />

            <LearningPoint
              number="03"
              title="Decision Making"
              description="Evaluate situations carefully before making important decisions."
            />

            <LearningPoint
              number="04"
              title="Responsibility"
              description="Take accountability for actions and outcomes."
            />

            <Text style={styles.articleHeading}>
              Reflection
            </Text>

            <Text style={styles.articleText}>
              Think about a situation where you had
              to lead a group. What communication
              strategy helped your team complete its
              task?
            </Text>
          </View>
        )}

        {/* ==================================================
            READING PROGRESS
        ================================================== */}

        <View style={styles.readerProgressCard}>
          <View
            style={
              styles.readerProgressHeader
            }
          >
            <Text
              style={
                styles.readerProgressTitle
              }
            >
              Reading Progress
            </Text>

            <Text
              style={
                styles.readerProgressPercent
              }
            >
              {material.progress ?? 0}%
            </Text>
          </View>

          <View
            style={styles.readerProgressTrack}
          >
            <View
              style={[
                styles.readerProgressFill,
                {
                  width: `${material.progress ?? 0}%`,
                },
              ]}
            />
          </View>

          <Text
            style={styles.readerProgressText}
          >
            Your progress is saved automatically.
          </Text>
        </View>

        {/* ==================================================
            COMPLETE BUTTON
        ================================================== */}

        <Pressable
          style={styles.completeButton}
          onPress={() =>
            Alert.alert(
              "Material Completed",
              "Your learning progress has been updated.",
            )
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.completeButtonText}>
            Mark as Completed
          </Text>
        </Pressable>

        <View style={styles.readerBottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// LEARNING POINT
// ============================================================

function LearningPoint({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.learningPoint}>
      <View style={styles.learningPointNumber}>
        <Text
          style={
            styles.learningPointNumberText
          }
        >
          {number}
        </Text>
      </View>

      <View style={styles.learningPointInfo}>
        <Text style={styles.learningPointTitle}>
          {title}
        </Text>

        <Text
          style={styles.learningPointDescription}
        >
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
    paddingTop: 58,
    paddingBottom: 110,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
    marginTop: 4,
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
  // TRAINING CARD
  // ==========================================================

  trainingCard: {
    backgroundColor: "#2563EB",
    borderRadius: 21,
    padding: 17,
    marginBottom: 24,
  },

  trainingTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  trainingIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.15)",
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
    letterSpacing: 0.8,
    color: "#BFDBFE",
  },

  trainingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },

  trainingTrainer: {
    fontSize: 9,
    color: "#DBEAFE",
    marginTop: 3,
  },

  trainingProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
  },

  trainingProgressLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#DBEAFE",
  },

  trainingProgressValue: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  trainingProgressTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor:
      "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },

  trainingProgressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },

  trainingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
  },

  trainingStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  trainingStatText: {
    fontSize: 8,
    color: "#DBEAFE",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionHeader: {
    marginBottom: 11,
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
  // CONTINUE
  // ==========================================================

  continueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  continueIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  continueInfo: {
    flex: 1,
  },

  continueLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.8,
  },

  continueTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  continueSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },

  continueProgressTrack: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginTop: 8,
    overflow: "hidden",
  },

  continueProgressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },

  continueProgressText: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 3,
  },

  continueArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    marginBottom: 27,
  },

  learningStat: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  learningStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  learningStatValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },

  learningStatLabel: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 1,
  },

  // ==========================================================
  // MATERIAL HEADER
  // ==========================================================

  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  materialCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  materialCountText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 10,
    color: "#0F172A",
    marginLeft: 8,
  },

  // ==========================================================
  // FILTER
  // ==========================================================

  filterContainer: {
    gap: 7,
    paddingBottom: 14,
  },

  filterButton: {
    height: 34,
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  filterButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  // ==========================================================
  // MATERIAL CARD
  // ==========================================================

  materialList: {
    gap: 9,
  },

  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  materialCardLocked: {
    opacity: 0.65,
  },

  materialIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  materialInfo: {
    flex: 1,
    minWidth: 0,
  },

  materialTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  materialTitle: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  materialTitleLocked: {
    color: "#64748B",
  },

  materialSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  materialProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 6,
  },

  materialProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  materialProgressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  materialProgressText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#2563EB",
  },

  materialMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 7,
  },

  materialMetaText: {
    fontSize: 7,
    color: "#94A3B8",
  },

  materialStatus: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  statusCompleted: {
    backgroundColor: "#DCFCE7",
  },

  statusProgress: {
    backgroundColor: "#EFF6FF",
  },

  statusLocked: {
    backgroundColor: "#F1F5F9",
  },

  statusAvailable: {
    backgroundColor: "#F3E8FF",
  },

  materialStatusText: {
    fontSize: 6,
    fontWeight: "800",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 30,
    alignItems: "center",
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginTop: 10,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 14,
    color: "#94A3B8",
    marginTop: 4,
  },

  // ==========================================================
  // ASSESSMENT
  // ==========================================================

  assessmentSection: {
    marginTop: 28,
  },

  assessmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  assessmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  assessmentInfo: {
    flex: 1,
  },

  assessmentTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  assessmentSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  assessmentResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  assessmentResultText: {
    fontSize: 7,
    color: "#16A34A",
    fontWeight: "700",
  },

  assessmentArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // EXAM
  // ==========================================================

  examSection: {
    marginTop: 27,
  },

  examCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  examIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  examInfo: {
    flex: 1,
  },

  examTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#78350F",
  },

  examSubtitle: {
    fontSize: 8,
    color: "#92400E",
    marginTop: 3,
  },

  examStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  examStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D97706",
  },

  examStatusText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#D97706",
  },

  examButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#D97706",
  },

  examButtonText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // ==========================================================
  // NOTE
  // ==========================================================

  noteCard: {
    marginTop: 18,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  noteInfo: {
    flex: 1,
    marginLeft: 9,
  },

  noteTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
  },

  noteText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#2563EB",
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },

  // ==========================================================
  // READER
  // ==========================================================

  readerContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  readerHeader: {
    minHeight: 70,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  readerBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  readerHeaderInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  readerHeaderLabel: {
    fontSize: 6,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.8,
  },

  readerHeaderTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  readerBookmark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  readerContent: {
    padding: 20,
    paddingBottom: 40,
  },

  readerHero: {
    alignItems: "center",
    marginBottom: 20,
  },

  readerHeroIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  readerTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },

  readerSubtitle: {
    textAlign: "center",
    fontSize: 9,
    color: "#64748B",
    marginTop: 4,
  },

  // ==========================================================
  // VIDEO
  // ==========================================================

  videoPlayer: {
    height: 205,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },

  videoPlay: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  videoText: {
    fontSize: 9,
    color: "#CBD5E1",
    marginTop: 10,
  },

  // ==========================================================
  // ARTICLE
  // ==========================================================

  article: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  articleHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 9,
  },

  articleText: {
    fontSize: 11,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 15,
  },

  learningPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 13,
  },

  learningPointNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  learningPointNumberText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
  },

  learningPointInfo: {
    flex: 1,
  },

  learningPointTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  learningPointDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 2,
  },

  // ==========================================================
  // READER PROGRESS
  // ==========================================================

  readerProgressCard: {
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  readerProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  readerProgressTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  readerProgressPercent: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  readerProgressTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginTop: 8,
    overflow: "hidden",
  },

  readerProgressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },

  readerProgressText: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 6,
  },

  // ==========================================================
  // COMPLETE
  // ==========================================================

  completeButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  completeButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  readerBottomSpace: {
    height: 30,
  },
});