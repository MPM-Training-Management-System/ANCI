import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
};

type Props = {
  activities: Activity[];
};

export default function RecentActivity({
  activities,
}: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>
          Recent activity
        </Text>
      </View>

      <View style={styles.card}>
        {activities.map(
          (activity, index) => (
            <View
              key={activity.id}
              style={[
                styles.item,
                index <
                  activities.length - 1 &&
                  styles.itemBorder,
              ]}
            >
              <View style={styles.icon}>
                <Ionicons
                  name={
                    activity.icon as any
                  }
                  size={17}
                  color="#2563EB"
                />
              </View>

              <View style={styles.content}>
                <Text
                  style={styles.activityTitle}
                >
                  {activity.title}
                </Text>

                <Text
                  style={
                    styles.description
                  }
                >
                  {activity.description}
                </Text>
              </View>

              <Text style={styles.date}>
                {activity.date}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,

    marginBottom: 10,
  },

  title: {
    fontSize: 16,

    fontWeight: "800",

    color: "#0F172A",
  },

  card: {
    marginHorizontal: 20,

    paddingHorizontal: 14,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  item: {
    minHeight: 72,

    flexDirection: "row",

    alignItems: "center",

    gap: 10,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  icon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#EEF4FF",

    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 11,

    fontWeight: "800",

    color: "#0F172A",
  },

  description: {
    marginTop: 3,

    fontSize: 9,

    color: "#64748B",
  },

  date: {
    fontSize: 8,

    color: "#94A3B8",
  },
});