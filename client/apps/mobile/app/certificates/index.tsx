
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { certificateApi } from "@/api/api";
import type { Certificate } from "@repo/types";

const PRIMARY = "#002b5c";
const BACKGROUND = "#f7f9fb";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyCertificatesScreen() {
  const router = useRouter();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadCertificates = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await certificateApi.getMyCertificates();
      setCertificates(result ?? []);
    } catch (err) {
      console.error("Failed to load certificates:", err);
      setError(
        "Unable to load your certificates. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

 const openCertificate = (certificate: Certificate) => {
  if (!certificate.id) {
    Alert.alert(
      "Certificate Unavailable",
      "The certificate ID is missing.",
    );
    return;
  }

  router.push({
    pathname: "/certificates/[id]",
    params: {
      id: String(certificate.id),
    },
  });
};

  const renderCertificate = ({ item }: { item: Certificate }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => openCertificate(item)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.trainingName} certificate`}
    >
      <View style={styles.cardTop}>
        <View style={styles.certificateIcon}>
          <Text style={styles.certificateIconText}>★</Text>
        </View>

        <View style={styles.cardHeading}>
          <Text style={styles.trainingName}>
            {item.trainingName || "Training Certificate"}
          </Text>
          <Text style={styles.certificateType}>
            {item.type || "Certificate"}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <Text style={styles.fieldLabel}>Certificate Number</Text>
      <Text style={styles.fieldValue}>
        {item.certificateNumber || "Not available"}
      </Text>

      <Text style={styles.fieldLabel}>Batch Code</Text>
      <Text style={styles.fieldValue}>
        {item.batchCode || "Not available"}
      </Text>

      <Text style={styles.fieldLabel}>Date Issued</Text>
      <Text style={styles.fieldValue}>{formatDate(item.issuedAt)}</Text>

      {item.isRevoked ? (
        <View style={styles.revokedBadge}>
          <Text style={styles.revokedText}>Revoked</Text>
        </View>
      ) : (
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Certificate  →</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Certificates</Text>
          <Text style={styles.headerSubtitle}>
            View and download your earned certificates.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.helperText}>Loading certificates...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => void loadCertificates()}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={certificates}
          keyExtractor={(item) => item.id}
          renderItem={renderCertificate}
          contentContainerStyle={
            certificates.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadCertificates(true)}
              tintColor={PRIMARY}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>▤</Text>
              <Text style={styles.emptyTitle}>No Certificates Yet</Text>
              <Text style={styles.emptyDescription}>
                Your earned certificates will appear here once they have
                been issued.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5eaf0",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf3f9",
    marginRight: 12,
  },
  backButtonText: {
    color: PRIMARY,
    fontSize: 32,
    lineHeight: 36,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: PRIMARY,
    fontSize: 21,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    padding: 18,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  certificateIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#e8f1fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  certificateIconText: {
    color: "#b8860b",
    fontSize: 27,
  },
  cardHeading: {
    flex: 1,
  },
  trainingName: {
    color: "#172b4d",
    fontSize: 16,
    fontWeight: "700",
  },
  certificateType: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#e8edf3",
    marginVertical: 15,
  },
  fieldLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 9,
  },
  fieldValue: {
    color: "#172b4d",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },
  viewButton: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 18,
  },
  viewButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  revokedBadge: {
    backgroundColor: "#fee2e2",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  revokedText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  helperText: {
    color: "#64748b",
    marginTop: 12,
  },
  errorText: {
    color: "#b91c1c",
    textAlign: "center",
    lineHeight: 21,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 50,
    color: "#94a3b8",
    marginBottom: 14,
  },
  emptyTitle: {
    color: "#172b4d",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyDescription: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
});
