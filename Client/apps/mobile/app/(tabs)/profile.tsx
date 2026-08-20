import React, { useState } from "react";

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
import { useRouter } from "expo-router";

import { auth } from "@/api/auth";

// ============================================================
// TYPES
// ============================================================

type Certificate = {
  id: string;
  title: string;
  issuedDate: string;
  certificateId: string;
  score: string;
  trainer: string;
};

type TrainingHistory = {
  id: string;
  title: string;
  date: string;
  trainer: string;
  status: "Completed" | "In Progress";
  progress: number;
};

// ============================================================
// MOCK CERTIFICATES
// ============================================================

const CERTIFICATES: Certificate[] = [
  {
    id: "CERT-001",
    title: "Leadership Training",
    issuedDate: "August 30, 2026",
    certificateId: "CERT-26-0001",
    score: "92%",
    trainer: "Maria Santos",
  },

  {
    id: "CERT-002",
    title: "Basic Training",
    issuedDate: "July 29, 2026",
    certificateId: "CERT-26-0002",
    score: "88%",
    trainer: "Carlos Reyes",
  },

  {
    id: "CERT-003",
    title: "Communication Skills",
    issuedDate: "June 18, 2026",
    certificateId: "CERT-26-0003",
    score: "90%",
    trainer: "Maria Santos",
  },

  {
    id: "CERT-004",
    title: "Team Development",
    issuedDate: "May 22, 2026",
    certificateId: "CERT-26-0004",
    score: "86%",
    trainer: "Daniel Cruz",
  },
];

// ============================================================
// MOCK TRAINING HISTORY
// ============================================================

const TRAINING_HISTORY: TrainingHistory[] = [
  {
    id: "TRN-001",
    title: "Leadership Training",
    date: "August 12 – August 30, 2026",
    trainer: "Maria Santos",
    status: "In Progress",
    progress: 72,
  },

  {
    id: "TRN-002",
    title: "Basic Training",
    date: "July 15 – July 29, 2026",
    trainer: "Carlos Reyes",
    status: "Completed",
    progress: 100,
  },

  {
    id: "TRN-003",
    title: "Communication Skills",
    date: "June 05 – June 18, 2026",
    trainer: "Maria Santos",
    status: "Completed",
    progress: 100,
  },

  {
    id: "TRN-004",
    title: "Team Development",
    date: "May 08 – May 22, 2026",
    trainer: "Daniel Cruz",
    status: "Completed",
    progress: 100,
  },
];

// ============================================================
// MAIN PROFILE SCREEN
// ============================================================

export default function ProfileScreen() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [
    certificatesVisible,
    setCertificatesVisible,
  ] = useState(false);

  const [
    historyVisible,
    setHistoryVisible,
  ] = useState(false);

  const [
    selectedCertificate,
    setSelectedCertificate,
  ] = useState<Certificate | null>(null);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Sign Out",
          style: "destructive",

          onPress: async () => {
            try {
              setIsLoggingOut(true);

              console.log(
                "MOBILE LOGOUT STARTED",
              );

              await auth.logout();

              console.log(
                "MOBILE LOGOUT SUCCESS",
              );

              router.replace("/login");
            } catch (error) {
              console.error(
                "MOBILE LOGOUT ERROR:",
                error,
              );

              Alert.alert(
                "Logout Failed",
                "Something went wrong while signing out. Please try again.",
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  }

  // ==========================================================
  // CERTIFICATE
  // ==========================================================

  function openCertificate(
    certificate: Certificate,
  ) {
    setSelectedCertificate(certificate);
  }

  return (
    <View style={styles.container}>
      {/* ====================================================
          MAIN PROFILE SCROLL
      ==================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              My Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your participant account.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#2563EB"
            />
          </View>
        </View>

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={40}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.onlineIndicator}>
              <Ionicons
                name="checkmark"
                size={10}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.name}>
            Juan Dela Cruz
          </Text>

          <Text style={styles.email}>
            juan@email.com
          </Text>

          <View style={styles.participantBadge}>
            <Ionicons
              name="person-outline"
              size={11}
              color="#2563EB"
            />

            <Text
              style={styles.participantBadgeText}
            >
              PARTICIPANT
            </Text>
          </View>

          {/* PROFILE STATS */}

          <View style={styles.profileStats}>
            <ProfileStat
              value="4"
              label="Training"
            />

            <View
              style={styles.profileStatDivider}
            />

            <ProfileStat
              value="4"
              label="Certificates"
            />

            <View
              style={styles.profileStatDivider}
            />

            <ProfileStat
              value="92%"
              label="Best Score"
            />
          </View>
        </View>

        {/* ==================================================
            ACCOUNT
        ================================================== */}

        <SectionTitle title="Account" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Personal Information"
            subtitle="View and update your details"
            onPress={() =>
              Alert.alert(
                "Personal Information",
                "Personal information screen will be connected here.",
              )
            }
          />

          <MenuItem
            icon="mail-outline"
            title="Email Address"
            subtitle="juan@email.com"
            onPress={() =>
              Alert.alert(
                "Email Address",
                "Email management screen will be connected here.",
              )
            }
          />

          <MenuItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() =>
              Alert.alert(
                "Change Password",
                "Password management screen will be connected here.",
              )
            }
          />
        </View>

        {/* ==================================================
            ACHIEVEMENTS
        ================================================== */}

        <SectionTitle
          title="Achievements"
          subtitle="Your training accomplishments and records."
        />

        <View style={styles.menuCard}>
          <MenuItem
            icon="ribbon-outline"
            title="Certificates"
            subtitle={`${CERTIFICATES.length} certificates earned`}
            accent="#D97706"
            iconBackground="#FEF3C7"
            onPress={() =>
              setCertificatesVisible(true)
            }
          />

          <MenuItem
            icon="school-outline"
            title="Training History"
            subtitle={`${TRAINING_HISTORY.length} training records`}
            accent="#2563EB"
            iconBackground="#EFF6FF"
            onPress={() =>
              setHistoryVisible(true)
            }
          />
        </View>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <SectionTitle title="Security" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="shield-checkmark-outline"
            title="Account Verification"
            subtitle="Your account is verified"
            verified
            onPress={() =>
              Alert.alert(
                "Account Verified",
                "Your participant account has been successfully verified.",
              )
            }
          />

          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() =>
              Alert.alert(
                "Notifications",
                "Notification preferences will be connected here.",
              )
            }
          />
        </View>

        {/* ==================================================
            APP
        ================================================== */}

        <SectionTitle title="App" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            title="App Preferences"
            subtitle="Appearance and application settings"
            onPress={() =>
              Alert.alert(
                "App Preferences",
                "Application settings will be connected here.",
              )
            }
          />

          <MenuItem
            icon="information-circle-outline"
            title="About ACE NextGen"
            subtitle="Version 1.0.0"
            onPress={() =>
              Alert.alert(
                "ACE NextGen",
                "Participant Training Management System\n\nVersion 1.0.0",
              )
            }
          />
        </View>

        {/* ==================================================
            LOGOUT
        ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            isLoggingOut &&
              styles.logoutButtonDisabled,
            pressed &&
              !isLoggingOut &&
              styles.logoutPressed,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            {isLoggingOut
              ? "Signing Out..."
              : "Sign Out"}
          </Text>
        </Pressable>

        {/* ==================================================
            VERSION
        ================================================== */}

        <Text style={styles.version}>
          ACE NextGen Participant App{"\n"}
          Version 1.0.0
        </Text>

        {/* Extra space for floating tab */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ====================================================
          CERTIFICATES MODAL
      ==================================================== */}

      <Modal
        visible={certificatesVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() =>
          setCertificatesVisible(false)
        }
      >
        <CertificatesModal
          certificates={CERTIFICATES}
          onClose={() =>
            setCertificatesVisible(false)
          }
          onSelect={openCertificate}
        />
      </Modal>

      {/* ====================================================
          TRAINING HISTORY MODAL
      ==================================================== */}

      <Modal
        visible={historyVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() =>
          setHistoryVisible(false)
        }
      >
        <TrainingHistoryModal
          history={TRAINING_HISTORY}
          onClose={() =>
            setHistoryVisible(false)
          }
        />
      </Modal>

      {/* ====================================================
          CERTIFICATE DETAIL
      ==================================================== */}

      <Modal
        visible={selectedCertificate !== null}
        animationType="fade"
        transparent
        onRequestClose={() =>
          setSelectedCertificate(null)
        }
      >
        {selectedCertificate && (
          <CertificateDetail
            certificate={selectedCertificate}
            onClose={() =>
              setSelectedCertificate(null)
            }
          />
        )}
      </Modal>
    </View>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {subtitle && (
        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ============================================================
// PROFILE STAT
// ============================================================

function ProfileStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>
        {value}
      </Text>

      <Text style={styles.profileStatLabel}>
        {label}
      </Text>
    </View>
  );
}

// ============================================================
// MENU ITEM
// ============================================================

function MenuItem({
  icon,
  title,
  subtitle,
  verified,
  accent = "#2563EB",
  iconBackground = "#EFF6FF",
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  verified?: boolean;
  accent?: string;
  iconBackground?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={accent}
        />
      </View>

      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      {verified ? (
        <View style={styles.verifiedIcon}>
          <Ionicons
            name="checkmark"
            size={12}
            color="#FFFFFF"
          />
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
        />
      )}
    </Pressable>
  );
}

// ============================================================
// CERTIFICATES MODAL
// ============================================================

function CertificatesModal({
  certificates,
  onClose,
  onSelect,
}: {
  certificates: Certificate[];
  onClose: () => void;
  onSelect: (certificate: Certificate) => void;
}) {
  return (
    <View style={styles.modalContainer}>
      {/* HEADER */}

      <View style={styles.modalHeader}>
        <Pressable
          style={styles.modalBackButton}
          onPress={onClose}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.modalHeaderInfo}>
          <Text style={styles.modalHeaderTitle}>
            Certificates
          </Text>

          <Text
            style={styles.modalHeaderSubtitle}
          >
            Your earned certificates
          </Text>
        </View>

        <View style={styles.modalHeaderIcon}>
          <Ionicons
            name="ribbon-outline"
            size={21}
            color="#D97706"
          />
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}

      <ScrollView
        style={styles.modalScroll}
        contentContainerStyle={
          styles.modalContent
        }
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {/* SUMMARY */}

        <View style={styles.certificateSummary}>
          <View
            style={styles.certificateSummaryIcon}
          >
            <Ionicons
              name="trophy"
              size={27}
              color="#D97706"
            />
          </View>

          <View
            style={styles.certificateSummaryInfo}
          >
            <Text
              style={
                styles.certificateSummaryTitle
              }
            >
              {certificates.length} Certificates
            </Text>

            <Text
              style={
                styles.certificateSummaryText
              }
            >
              Keep building your training
              achievements.
            </Text>
          </View>
        </View>

        {/* LIST */}

        <Text style={styles.modalSectionTitle}>
          Earned Certificates
        </Text>

        <View style={styles.certificateList}>
          {certificates.map(
            (certificate) => (
              <Pressable
                key={certificate.id}
                style={({ pressed }) => [
                  styles.certificateListCard,
                  pressed &&
                    styles.menuPressed,
                ]}
                onPress={() =>
                  onSelect(certificate)
                }
              >
                <View
                  style={
                    styles.certificateListIcon
                  }
                >
                  <Ionicons
                    name="ribbon"
                    size={23}
                    color="#D97706"
                  />
                </View>

                <View
                  style={
                    styles.certificateListInfo
                  }
                >
                  <View
                    style={
                      styles.certificateTitleRow
                    }
                  >
                    <Text
                      style={
                        styles.certificateListTitle
                      }
                      numberOfLines={2}
                    >
                      {certificate.title}
                    </Text>

                    <View
                      style={
                        styles.verifiedBadge
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={9}
                        color="#16A34A"
                      />

                      <Text
                        style={
                          styles.verifiedBadgeText
                        }
                      >
                        VERIFIED
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.certificateListDate
                    }
                  >
                    Issued{" "}
                    {certificate.issuedDate}
                  </Text>

                  <Text
                    style={
                      styles.certificateListId
                    }
                  >
                    {certificate.certificateId}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>
            ),
          )}
        </View>

        <View style={styles.modalBottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// CERTIFICATE DETAIL
// ============================================================

function CertificateDetail({
  certificate,
  onClose,
}: {
  certificate: Certificate;
  onClose: () => void;
}) {
  return (
    <View style={styles.detailOverlay}>
      <View style={styles.detailContainer}>
        {/* HEADER */}

        <View style={styles.detailHeader}>
          <Text style={styles.detailHeaderTitle}>
            Certificate
          </Text>

          <Pressable
            style={styles.detailClose}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={21}
              color="#0F172A"
            />
          </Pressable>
        </View>

        {/* SCROLLABLE DETAIL */}

        <ScrollView
          style={styles.detailScroll}
          contentContainerStyle={
            styles.detailContent
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* CERTIFICATE PAPER */}

          <View style={styles.certificatePaper}>
            <View
              style={
                styles.certificatePaperTop
              }
            >
              <View
                style={
                  styles.certificateRibbon
                }
              >
                <Ionicons
                  name="ribbon"
                  size={34}
                  color="#D97706"
                />
              </View>

              <View
                style={
                  styles.certificateVerified
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#16A34A"
                />

                <Text
                  style={
                    styles.certificateVerifiedText
                  }
                >
                  VERIFIED
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.certificatePaperLabel
              }
            >
              CERTIFICATE OF COMPLETION
            </Text>

            <Text
              style={
                styles.certificatePaperTitle
              }
            >
              {certificate.title}
            </Text>

            <View
              style={
                styles.certificateLine
              }
            />

            <Text
              style={
                styles.certificateIssuedLabel
              }
            >
              This certificate is awarded to
            </Text>

            <Text
              style={
                styles.certificateRecipient
              }
            >
              Juan Dela Cruz
            </Text>

            <Text
              style={
                styles.certificateCompletionText
              }
            >
              for successfully completing the
              required training program.
            </Text>

            <Text
              style={
                styles.certificateIssuedDate
              }
            >
              Issued {certificate.issuedDate}
            </Text>

            <View
              style={
                styles.certificateBottom
              }
            >
              <View>
                <Text
                  style={
                    styles.certificateSmallLabel
                  }
                >
                  CERTIFICATE ID
                </Text>

                <Text
                  style={
                    styles.certificateSmallValue
                  }
                >
                  {certificate.certificateId}
                </Text>
              </View>

              <View
                style={
                  styles.certificateQr
                }
              >
                <Ionicons
                  name="qr-code-outline"
                  size={35}
                  color="#0F172A"
                />
              </View>
            </View>
          </View>

          {/* RESULT */}

          <View style={styles.detailStats}>
            <View style={styles.detailStatCard}>
              <Text
                style={
                  styles.detailStatLabel
                }
              >
                FINAL SCORE
              </Text>

              <Text
                style={
                  styles.detailStatValue
                }
              >
                {certificate.score}
              </Text>
            </View>

            <View style={styles.detailStatCard}>
              <Text
                style={
                  styles.detailStatLabel
                }
              >
                TRAINER
              </Text>

              <Text
                style={[
                  styles.detailStatValue,
                  styles.trainerValue,
                ]}
                numberOfLines={2}
              >
                {certificate.trainer}
              </Text>
            </View>
          </View>

          {/* DOWNLOAD */}

          <Pressable
            style={styles.primaryDetailButton}
            onPress={() =>
              Alert.alert(
                "Certificate",
                "Download functionality will be connected to the backend later.",
              )
            }
          >
            <Ionicons
              name="download-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryDetailButtonText
              }
            >
              Download Certificate
            </Text>
          </Pressable>

          {/* VERIFY */}

          <Pressable
            style={styles.secondaryDetailButton}
            onPress={() =>
              Alert.alert(
                "Certificate Verification",
                `Certificate ID: ${certificate.certificateId}`,
              )
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#2563EB"
            />

            <Text
              style={
                styles.secondaryDetailButtonText
              }
            >
              Verify Certificate
            </Text>
          </Pressable>

          <View style={styles.detailBottomSpace} />
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================
// TRAINING HISTORY MODAL
// ============================================================

function TrainingHistoryModal({
  history,
  onClose,
}: {
  history: TrainingHistory[];
  onClose: () => void;
}) {
  return (
    <View style={styles.modalContainer}>
      {/* HEADER */}

      <View style={styles.modalHeader}>
        <Pressable
          style={styles.modalBackButton}
          onPress={onClose}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.modalHeaderInfo}>
          <Text style={styles.modalHeaderTitle}>
            Training History
          </Text>

          <Text
            style={styles.modalHeaderSubtitle}
          >
            Your training records
          </Text>
        </View>

        <View style={styles.modalHeaderIcon}>
          <Ionicons
            name="school-outline"
            size={21}
            color="#2563EB"
          />
        </View>
      </View>

      {/* SCROLLABLE HISTORY */}

      <ScrollView
        style={styles.modalScroll}
        contentContainerStyle={
          styles.modalContent
        }
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* SUMMARY */}

        <View style={styles.historySummary}>
          <View style={styles.historySummaryIcon}>
            <Ionicons
              name="school"
              size={26}
              color="#2563EB"
            />
          </View>

          <View style={styles.historySummaryInfo}>
            <Text
              style={styles.historySummaryTitle}
            >
              Training Journey
            </Text>

            <Text
              style={styles.historySummaryText}
            >
              Track your progress across all
              training programs.
            </Text>
          </View>
        </View>

        <Text style={styles.modalSectionTitle}>
          Training Records
        </Text>

        <View style={styles.historyList}>
          {history.map((training) => {
            const completed =
              training.status === "Completed";

            return (
              <View
                key={training.id}
                style={styles.historyCard}
              >
                <View
                  style={[
                    styles.historyIcon,
                    completed
                      ? styles.historyIconCompleted
                      : styles.historyIconCurrent,
                  ]}
                >
                  <Ionicons
                    name={
                      completed
                        ? "checkmark-circle"
                        : "school-outline"
                    }
                    size={23}
                    color={
                      completed
                        ? "#16A34A"
                        : "#2563EB"
                    }
                  />
                </View>

                <View
                  style={styles.historyInfo}
                >
                  <Text
                    style={styles.historyTitle}
                  >
                    {training.title}
                  </Text>

                  <Text
                    style={styles.historyDate}
                  >
                    {training.date}
                  </Text>

                  <Text
                    style={styles.historyTrainer}
                  >
                    Trainer: {training.trainer}
                  </Text>

                  <View
                    style={
                      styles.historyProgressRow
                    }
                  >
                    <View
                      style={
                        styles.historyProgressTrack
                      }
                    >
                      <View
                        style={[
                          styles.historyProgressFill,
                          {
                            width: `${training.progress}%`,
                            backgroundColor:
                              completed
                                ? "#16A34A"
                                : "#2563EB",
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.historyProgressText
                      }
                    >
                      {training.progress}%
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.historyStatus,
                    completed
                      ? styles.historyStatusCompleted
                      : styles.historyStatusCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyStatusText,
                      {
                        color: completed
                          ? "#16A34A"
                          : "#2563EB",
                      },
                    ]}
                  >
                    {completed
                      ? "Completed"
                      : "Current"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.modalBottomSpace} />
      </ScrollView>
    </View>
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
    marginBottom: 21,
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
  // PROFILE CARD
  // ==========================================================

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 21,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 28,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 11,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  email: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },

  participantBadgeText: {
    color: "#2563EB",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  profileStats: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  profileStat: {
    flex: 1,
    alignItems: "center",
  },

  profileStatValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  profileStatLabel: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 3,
  },

  profileStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
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
  // MENU
  // ==========================================================

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 27,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  menuPressed: {
    backgroundColor: "#F8FAFC",
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  menuSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
  },

  verifiedIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logoutButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutPressed: {
    opacity: 0.7,
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
  },

  version: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 15,
    color: "#94A3B8",
    marginTop: 20,
  },

  bottomSpace: {
    height: 30,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  modalHeader: {
    minHeight: 76,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  modalHeaderInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalHeaderSubtitle: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },

  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    flex: 1,
  },

  modalContent: {
    padding: 20,
    paddingBottom: 70,
  },

  modalSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 11,
  },

  modalBottomSpace: {
    height: 30,
  },

  // ==========================================================
  // CERTIFICATE SUMMARY
  // ==========================================================

  certificateSummary: {
    backgroundColor: "#FFFBEB",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  certificateSummaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  certificateSummaryInfo: {
    flex: 1,
    marginLeft: 11,
  },

  certificateSummaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#78350F",
  },

  certificateSummaryText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#92400E",
    marginTop: 3,
  },

  // ==========================================================
  // CERTIFICATE LIST
  // ==========================================================

  certificateList: {
    gap: 10,
  },

  certificateListCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  certificateListIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  certificateListInfo: {
    flex: 1,
    minWidth: 0,
  },

  certificateTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },

  certificateListTitle: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  certificateListDate: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 4,
  },

  certificateListId: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 4,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
  },

  verifiedBadgeText: {
    fontSize: 5,
    fontWeight: "800",
    color: "#16A34A",
  },

  // ==========================================================
  // TRAINING HISTORY
  // ==========================================================

  historySummary: {
    backgroundColor: "#EFF6FF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  historySummaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  historySummaryInfo: {
    flex: 1,
    marginLeft: 11,
  },

  historySummaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  historySummaryText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#2563EB",
    marginTop: 3,
  },

  historyList: {
    gap: 10,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  historyIconCompleted: {
    backgroundColor: "#DCFCE7",
  },

  historyIconCurrent: {
    backgroundColor: "#EFF6FF",
  },

  historyInfo: {
    flex: 1,
    minWidth: 0,
  },

  historyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  historyDate: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  historyTrainer: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 3,
  },

  historyProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  historyProgressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  historyProgressFill: {
    height: "100%",
    borderRadius: 5,
  },

  historyProgressText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#64748B",
  },

  historyStatus: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },

  historyStatusCompleted: {
    backgroundColor: "#DCFCE7",
  },

  historyStatusCurrent: {
    backgroundColor: "#EFF6FF",
  },

  historyStatusText: {
    fontSize: 6,
    fontWeight: "800",
  },

  // ==========================================================
  // CERTIFICATE DETAIL
  // ==========================================================

  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  detailContainer: {
    height: "92%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },

  detailHeader: {
    height: 65,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  detailClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  detailScroll: {
    flex: 1,
  },

  detailContent: {
    padding: 20,
    paddingBottom: 70,
  },

  // ==========================================================
  // CERTIFICATE PAPER
  // ==========================================================

  certificatePaper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  certificatePaperTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  certificateRibbon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  certificateVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  certificateVerifiedText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#16A34A",
  },

  certificatePaperLabel: {
    textAlign: "center",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#64748B",
    marginTop: 22,
  },

  certificatePaperTitle: {
    textAlign: "center",
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },

  certificateLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 19,
  },

  certificateIssuedLabel: {
    textAlign: "center",
    fontSize: 9,
    color: "#94A3B8",
  },

  certificateRecipient: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 6,
  },

  certificateCompletionText: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 15,
    color: "#64748B",
    marginTop: 8,
  },

  certificateIssuedDate: {
    textAlign: "center",
    fontSize: 9,
    color: "#64748B",
    marginTop: 8,
  },

  certificateBottom: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 19,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  certificateSmallLabel: {
    fontSize: 6,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  certificateSmallValue: {
    fontSize: 8,
    fontWeight: "700",
    color: "#334155",
    marginTop: 3,
  },

  certificateQr: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // CERTIFICATE DETAIL STATS
  // ==========================================================

  detailStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  detailStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
  },

  detailStatLabel: {
    fontSize: 6,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },

  detailStatValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 5,
  },

  trainerValue: {
    fontSize: 11,
  },

  // ==========================================================
  // DETAIL BUTTONS
  // ==========================================================

  primaryDetailButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 15,
  },

  primaryDetailButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  secondaryDetailButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 9,
  },

  secondaryDetailButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  detailBottomSpace: {
    height: 20,
  },
});