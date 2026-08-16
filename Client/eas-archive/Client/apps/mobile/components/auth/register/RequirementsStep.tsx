import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { Button } from "@repo/ui-mobile";

export default function RequirementsStep() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [governmentId, setGovernmentId] = useState<string | null>(null);

  const [resume, setResume] = useState<string | null>(null);

  const [certificate, setCertificate] = useState<string | null>(null);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}

      <Text style={styles.label}>
        Profile Picture *
      </Text>

      <Pressable style={styles.uploadBox}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.image}
          />
        ) : (
          <>
            <Ionicons
              name="person-circle-outline"
              size={60}
              color="#2563EB"
            />

            <Text style={styles.uploadText}>
              Upload Profile Picture
            </Text>
          </>
        )}
      </Pressable>

      {/* Government ID */}

      <Text style={styles.label}>
        Government ID *
      </Text>

      <Button
        variant="outline"
        onPress={() => {}}
      >
        {governmentId
          ? "Government ID Selected"
          : "Choose Government ID"}
      </Button>

      {/* Resume */}

      <Text style={styles.label}>
        Resume (Optional)
      </Text>

      <Button
        variant="outline"
        onPress={() => {}}
      >
        {resume
          ? "Resume Selected"
          : "Upload Resume"}
      </Button>

      {/* Certificate */}

      <Text style={styles.label}>
        Certificate (Optional)
      </Text>

      <Button
        variant="outline"
        onPress={() => {}}
      >
        {certificate
          ? "Certificate Selected"
          : "Upload Certificate"}
      </Button>

      <View style={styles.note}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#2563EB"
        />

        <Text style={styles.noteText}>
          Accepted formats:
          JPG, PNG, PDF (Max 5MB)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 40,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },

  uploadBox: {
    height: 190,

    borderRadius: 20,

    borderWidth: 2,

    borderStyle: "dashed",

    borderColor: "#CBD5E1",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F8FAFC",
  },

  uploadText: {
    marginTop: 10,

    color: "#64748B",

    fontSize: 15,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  note: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#EFF6FF",

    borderRadius: 14,

    padding: 12,
  },

  noteText: {
    marginLeft: 8,

    color: "#2563EB",

    flex: 1,

    fontSize: 13,
  },
});