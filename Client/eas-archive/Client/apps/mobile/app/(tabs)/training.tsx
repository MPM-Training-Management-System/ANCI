import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          My Training
        </Text>

        <Text style={styles.subtitle}>
          View your upcoming and completed training
          sessions.
        </Text>

        {/* Upcoming */}

        <Text style={styles.sectionTitle}>
          Upcoming
        </Text>

        <TrainingCard
          day="12"
          month="AUG"
          title="Leadership Training"
          time="9:00 AM"
          location="Training Center"
          status="Upcoming"
        />

        <TrainingCard
          day="18"
          month="AUG"
          title="Team Development"
          time="1:00 PM"
          location="Training Hall"
          status="Upcoming"
        />

        {/* Completed */}

        <Text style={styles.sectionTitle}>
          Completed
        </Text>

        <TrainingCard
          day="05"
          month="AUG"
          title="Communication Skills"
          time="9:00 AM"
          location="Training Center"
          status="Completed"
        />

        <TrainingCard
          day="29"
          month="JUL"
          title="Basic Training"
          time="10:00 AM"
          location="Training Center"
          status="Completed"
        />

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function TrainingCard({
  day,
  month,
  title,
  time,
  location,
  status,
}: {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  status: "Upcoming" | "Completed";
}) {
  const completed = status === "Completed";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.dateBox,
          completed && styles.completedDate,
        ]}
      >
        <Text
          style={[
            styles.month,
            completed && styles.completedText,
          ]}
        >
          {month}
        </Text>

        <Text
          style={[
            styles.day,
            completed && styles.completedText,
          ]}
        >
          {day}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.trainingTitle}>
          {title}
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#64748B"
          />

          <Text style={styles.detail}>
            {time}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#64748B"
          />

          <Text style={styles.detail}>
            {location}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.badge,
          completed
            ? styles.completedBadge
            : styles.upcomingBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            completed
              ? styles.completedBadgeText
              : styles.upcomingBadgeText,
          ]}
        >
          {status}
        </Text>
      </View>
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
    paddingTop: 60,
    paddingBottom: 110,
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
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },

  dateBox: {
    width: 58,
    height: 62,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  completedDate: {
    backgroundColor: "#F1F5F9",
  },

  month: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  day: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  completedText: {
    color: "#64748B",
  },

  info: {
    flex: 1,
  },

  trainingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  detail: {
    fontSize: 10,
    color: "#64748B",
    marginLeft: 5,
  },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 5,
  },

  upcomingBadge: {
    backgroundColor: "#DCFCE7",
  },

  completedBadge: {
    backgroundColor: "#F1F5F9",
  },

  badgeText: {
    fontSize: 7,
    fontWeight: "800",
  },

  upcomingBadgeText: {
    color: "#16A34A",
  },

  completedBadgeText: {
    color: "#64748B",
  },

  bottomSpace: {
    height: 30,
  },
});