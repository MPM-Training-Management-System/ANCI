
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { AppAlert } from "@repo/ui-mobile";

import { certificateApi } from "@/api/api";
import type { Certificate } from "@repo/types";

const COLORS = {
  primary: "#002b5c",
  secondary: "#3B7597",
  background: "#f7f9fb",
  white: "#ffffff",
  text: "#172b4d",
  muted: "#64748b",
  border: "#e2e8f0",
  danger: "#b91c1c",
  dangerBg: "#fee2e2",
  blueBg: "#eaf2ff",
};

type AlertType = "success" | "error" | "warning" | "info";

interface AppAlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

export default function CertificateDetailsScreen() {
  const router = useRouter();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [appAlert, setAppAlert] = useState<AppAlertState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    onConfirm: () => {},
  });

  // =========================================================
  // CUSTOM APP ALERT
  // =========================================================

  const showAppAlert = useCallback(
    (
      type: AlertType,
      title: string,
      message: string,
      onConfirm: () => void = () => {},
      confirmText = "OK",
    ) => {
      setAppAlert({
        visible: true,
        type,
        title,
        message,
        confirmText,
        onConfirm,
      });
    },
    [],
  );

  const closeAppAlert = useCallback(() => {
    setAppAlert((previous) => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const handleAlertConfirm = useCallback(() => {
    const action = appAlert.onConfirm;

    setAppAlert((previous) => ({
      ...previous,
      visible: false,
    }));

    action();
  }, [appAlert.onConfirm]);

  // =========================================================
  // LOAD CERTIFICATES
  // =========================================================

  const loadCertificates = useCallback(async () => {
    try {
      setError(null);

      const result = await certificateApi.getMyCertificates();

      setCertificates(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load certificates:", err);

      setError(
        "Unable to load your certificates. Please check your internet connection.",
      );
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        await loadCertificates();
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [loadCertificates]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadCertificates();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = async () => {
    setLoading(true);

    try {
      await loadCertificates();
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN OFFICIAL PDF
  // =========================================================

  const handleViewPdf = async (certificate: Certificate) => {
    if (certificate.isRevoked) {
      showAppAlert(
        "error",
        "Certificate Revoked",
        "This certificate has been revoked and is no longer valid.",
      );
      return;
    }

    if (!certificate.pdfUrl) {
      showAppAlert(
        "warning",
        "PDF Unavailable",
        "The official PDF is not available for this certificate yet.",
      );
      return;
    }

    try {
      await Linking.openURL(certificate.pdfUrl);
    } catch (err) {
      console.error("Unable to open official certificate PDF:", err);

      showAppAlert(
        "error",
        "Unable to Open PDF",
        "Please try again later or check whether the PDF link is valid.",
      );
    }
  };

  // =========================================================
  // DOWNLOAD OFFICIAL PDF
  // =========================================================

  const handleDownloadPdf = async (certificate: Certificate) => {
    if (certificate.isRevoked) {
      showAppAlert(
        "error",
        "Certificate Revoked",
        "This certificate is no longer valid.",
      );
      return;
    }

    if (!certificate.pdfUrl) {
      showAppAlert(
        "warning",
        "PDF Unavailable",
        "The official PDF URL is missing.",
      );
      return;
    }

    try {
      setDownloadingId(String(certificate.id));

      const safeFileName = String(
        certificate.certificateNumber || certificate.id,
      ).replace(/[^a-zA-Z0-9_-]/g, "_");

      const fileName = `Certificate-${safeFileName}.pdf`;

      const cacheDirectory = FileSystem.cacheDirectory;

      if (!cacheDirectory) {
        throw new Error("Temporary file storage is unavailable.");
      }

      // Download the official PDF to temporary app storage.
      const tempUri = `${cacheDirectory}${fileName}`;

      const result = await FileSystem.downloadAsync(
        certificate.pdfUrl,
        tempUri,
      );

      if (result.status < 200 || result.status >= 300) {
        throw new Error(`PDF download failed: HTTP ${result.status}`);
      }

      // Android system folder picker.
      const SAF = FileSystem.StorageAccessFramework;

      if (!SAF) {
        throw new Error(
          "Android file saving is unavailable in this app environment.",
        );
      }

      const permission =
        await SAF.requestDirectoryPermissionsAsync();

      if (!permission.granted) {
        showAppAlert(
          "warning",
          "Save Cancelled",
          "No folder was selected. Your certificate was not saved.",
        );
        return;
      }

      const destinationUri = await SAF.createFileAsync(
        permission.directoryUri,
        fileName,
        "application/pdf",
      );

      // Write the downloaded PDF to the selected folder.
      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(destinationUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      showAppAlert(
        "success",
        "Download Complete",
        `${fileName} was saved to the folder you selected.`,
      );
    } catch (err) {
      console.error("Certificate download error:", err);

      showAppAlert(
        "error",
        "Download Failed",
        err instanceof Error
          ? err.message
          : "Unable to download the certificate. Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Loading your certificates...
          </Text>
        </View>

        <AppAlert
          visible={appAlert.visible}
          type={appAlert.type}
          title={appAlert.title}
          message={appAlert.message}
          confirmText={appAlert.confirmText}
          onConfirm={handleAlertConfirm}
          onCancel={closeAppAlert}
          showCancel={false}
        />
      </>
    );
  }

  // =========================================================
  // CERTIFICATE CARD
  // =========================================================

  const renderCertificate = ({ item }: { item: Certificate }) => {
    const revoked = Boolean(item.isRevoked);
    const isDownloading = downloadingId === String(item.id);
    const pdfUnavailable = !item.pdfUrl;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.pdfIcon}>
            <Text style={styles.pdfIconText}>PDF</Text>
          </View>

          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.trainingName || "Training Certificate"}
            </Text>

            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.certificateNumber || `Certificate #${item.id}`}
            </Text>

            <Text style={styles.issuedDate}>
              Issued:{" "}
              {item.issuedAt
                ? new Date(item.issuedAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date unavailable"}
            </Text>
          </View>
        </View>

        {revoked && (
          <View style={styles.revokedNotice}>
            <Text style={styles.revokedNoticeText}>
              This certificate has been revoked.
            </Text>
          </View>
        )}

        {pdfUnavailable && !revoked && (
          <Text style={styles.unavailableText}>
            The official PDF is not available yet.
          </Text>
        )}

        <View style={styles.cardActions}>
          <Pressable
            style={[
              styles.viewButton,
              (revoked || pdfUnavailable) && styles.disabledButton,
            ]}
            disabled={revoked || pdfUnavailable}
            onPress={() => void handleViewPdf(item)}
            accessibilityRole="button"
          >
            <Text style={styles.viewButtonText}>
              View Official PDF
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.downloadButton,
              (revoked || pdfUnavailable || isDownloading) &&
                styles.disabledDownloadButton,
            ]}
            disabled={revoked || pdfUnavailable || isDownloading}
            onPress={() => void handleDownloadPdf(item)}
            accessibilityRole="button"
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.downloadButtonText}>
                Download PDF
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  // =========================================================
  // MAIN CERTIFICATES PAGE
  // =========================================================

  return (
    <>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Certificates</Text>
            <Text style={styles.headerSubtitle}>
              View and download your official certificates
            </Text>
          </View>
        </View>

        <View style={styles.countRow}>
          <Text style={styles.countLabel}>Your certificates</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {certificates.length}
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              Unable to Load Certificates
            </Text>

            <Text style={styles.errorMessage}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => void handleRetry()}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={certificates}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCertificate}
            contentContainerStyle={
              certificates.length === 0
                ? styles.emptyListContent
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void handleRefresh()}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>PDF</Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No Certificates Yet
                </Text>

                <Text style={styles.emptyMessage}>
                  Your issued training certificates will appear here when
                  they become available.
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={() => void handleRetry()}
                  accessibilityRole="button"
                >
                  <Text style={styles.retryButtonText}>
                    Refresh Certificates
                  </Text>
                </Pressable>
              </View>
            }
            ListFooterComponent={
              certificates.length > 0 ? (
                <Text style={styles.footerText}>
                  {certificates.length} certificate
                  {certificates.length === 1 ? "" : "s"} available
                </Text>
              ) : null
            }
          />
        )}
      </View>

      <AppAlert
        visible={appAlert.visible}
        type={appAlert.type}
        title={appAlert.title}
        message={appAlert.message}
        confirmText={appAlert.confirmText}
        onConfirm={handleAlertConfirm}
        onCancel={closeAppAlert}
        showCancel={false}
      />
    </>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 32,
    lineHeight: 35,
    marginTop: -3,
    color: COLORS.primary,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 17,
  },

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  countLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "700",
  },

  countBadge: {
    marginLeft: 8,
    backgroundColor: COLORS.blueBg,
    borderRadius: 20,
    minWidth: 27,
    height: 25,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  listContent: {
    paddingBottom: 28,
  },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  pdfIcon: {
    width: 52,
    height: 58,
    borderRadius: 10,
    backgroundColor: COLORS.blueBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  pdfIconText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },

  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  issuedDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  cardActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 17,
  },

  viewButton: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  viewButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },

  downloadButton: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  downloadButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.4,
  },

  disabledDownloadButton: {
    opacity: 0.45,
  },

  revokedNotice: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 8,
    padding: 9,
    marginTop: 13,
  },

  revokedNoticeText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "700",
  },

  unavailableText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 18,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: COLORS.blueBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyIconText: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: "900",
  },

  emptyTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyMessage: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
    marginBottom: 18,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  errorTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  errorMessage: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  footerText: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 11,
    paddingTop: 8,
    paddingBottom: 14,
  },
});
