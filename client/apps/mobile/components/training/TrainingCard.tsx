import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  TrainingBatch,
} from "@repo/types";


interface Props {
  training: TrainingBatch;

  onPress: () => void;
}


export default function TrainingCard({
  training,
  onPress,
}: Props) {

  // =========================================================
  // CAPACITY
  // =========================================================

  const remainingSlots = Math.max(
    training.capacity -
      training.enrolledCount,
    0
  );

  const isFull =
    remainingSlots === 0;


  // =========================================================
  // PARTICIPANT LABEL
  // =========================================================

  const participantLabel =
    training.enrolledCount === 1
      ? "participant"
      : "participants";


  // =========================================================
  // SLOT LABEL
  // =========================================================

  const slotLabel =
    remainingSlots === 1
      ? "slot left"
      : "slots left";


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    date: string
  ) => {

    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  };


  const startDate =
    formatDate(
      training.startDate
    );


  const endDate =
    formatDate(
      training.endDate
    );


  const dateRange =
    startDate === endDate
      ? startDate
      : `${startDate} - ${endDate}`;


  // =========================================================
  // STATUS
  // =========================================================

  const statusLabel =
    training.status === "Published"
      ? "Published"
      : training.status === "Ongoing"
      ? "Ongoing"
      : training.status === "Completed"
      ? "Completed"
      : training.status === "Cancelled"
      ? "Cancelled"
      : "Draft";


  const statusStyle =
    training.status === "Ongoing"
      ? styles.ongoingBadge
      : training.status === "Completed"
      ? styles.completedBadge
      : training.status === "Cancelled"
      ? styles.cancelledBadge
      : training.status === "Published"
      ? styles.publishedBadge
      : styles.draftBadge;


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <Pressable
      onPress={
        onPress
      }

      style={({ pressed }) => [
        styles.card,

        pressed &&
          styles.pressed,
      ]}
    >

      {/* =================================================
          TOP
      ================================================= */}

      <View
        style={
          styles.topRow
        }
      >

        <View
          style={
            styles.iconBox
          }
        >

          <Ionicons
            name="school-outline"
            size={21}
            color="#2563EB"
          />

        </View>


        <View
          style={[
            styles.statusBadge,
            statusStyle,
          ]}
        >

          <Text
            style={
              styles.statusText
            }
          >
            {statusLabel}
          </Text>

        </View>

      </View>


      {/* =================================================
          BATCH CODE
      ================================================= */}

      <Text
        style={
          styles.batchCode
        }
      >
        {training.batchCode}
      </Text>


      {/* =================================================
          PROGRAM NAME
      ================================================= */}

      <Text
        style={
          styles.title
        }

        numberOfLines={2}
      >
        {training.programName}
      </Text>


      {/* =================================================
          LOCATION
      ================================================= */}

      {training.location && (

        <View
          style={
            styles.infoRow
          }
        >

          <Ionicons
            name="location-outline"
            size={15}
            color="#64748B"
          />


          <Text
            style={
              styles.infoText
            }

            numberOfLines={1}
          >
            {training.location}
          </Text>

        </View>

      )}


      {/* =================================================
          DATE
      ================================================= */}

      <View
        style={
          styles.infoRow
        }
      >

        <Ionicons
          name="calendar-outline"
          size={15}
          color="#64748B"
        />


        <Text
          style={
            styles.infoText
          }

          numberOfLines={1}
        >
          {dateRange}
        </Text>

      </View>


      {/* =================================================
          PARTICIPANTS
      ================================================= */}

      <View
        style={
          styles.infoRow
        }
      >

        <Ionicons
          name="people-outline"
          size={15}
          color="#64748B"
        />


        <Text
          style={
            styles.infoText
          }
        >
          {training.enrolledCount} /{" "}
          {training.capacity}{" "}
          {participantLabel}
        </Text>

      </View>


      {/* =================================================
          FOOTER
      ================================================= */}

      <View
        style={
          styles.footer
        }
      >

        {/* =================================================
            AVAILABLE SLOTS
        ================================================= */}

        <View>

          <Text
            style={
              styles.slotsLabel
            }
          >
            AVAILABLE SLOTS
          </Text>


          <Text
            style={[
              styles.slots,

              isFull &&
                styles.fullSlots,
            ]}
          >

            {isFull
              ? "FULL"
              : `${remainingSlots} ${slotLabel}`}

          </Text>

        </View>


        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        <View
          style={
            styles.viewButton
          }
        >

          <Text
            style={
              styles.viewButtonText
            }
          >
            View Details
          </Text>


          <Ionicons
            name="arrow-forward"
            size={15}
            color="#2563EB"
          />

        </View>

      </View>

    </Pressable>

  );

}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    // =======================================================
    // CARD
    // =======================================================

    card: {
      marginHorizontal: 20,
      marginBottom: 14,

      padding: 16,

      borderRadius: 20,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      shadowColor: "#0F172A",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.05,

      shadowRadius: 8,

      elevation: 2,
    },


    pressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },


    // =======================================================
    // TOP ROW
    // =======================================================

    topRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },


    iconBox: {
      width: 40,
      height: 40,

      borderRadius: 13,

      backgroundColor: "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",
    },


    // =======================================================
    // STATUS
    // =======================================================

    statusBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 999,
    },


    publishedBadge: {
      backgroundColor: "#F1F5F9",
    },


    ongoingBadge: {
      backgroundColor: "#ECFDF5",
    },


    completedBadge: {
      backgroundColor: "#EFF6FF",
    },


    cancelledBadge: {
      backgroundColor: "#FEF2F2",
    },


    draftBadge: {
      backgroundColor: "#F8FAFC",
    },


    statusText: {
      fontSize: 8,
      fontWeight: "800",
      color: "#475569",
    },


    // =======================================================
    // BATCH CODE
    // =======================================================

    batchCode: {
      marginTop: 12,

      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1.4,

      color: "#2563EB",
    },


    // =======================================================
    // TITLE
    // =======================================================

    title: {
      marginTop: 3,

      fontSize: 17,

      lineHeight: 22,

      fontWeight: "900",

      color: "#0F172A",
    },


    // =======================================================
    // INFO
    // =======================================================

    infoRow: {
      marginTop: 9,

      flexDirection: "row",

      alignItems: "center",

      gap: 7,
    },


    infoText: {
      flex: 1,

      fontSize: 8.5,

      lineHeight: 13,

      color: "#64748B",

      fontWeight: "600",
    },


    // =======================================================
    // FOOTER
    // =======================================================

    footer: {
      marginTop: 15,

      paddingTop: 12,

      borderTopWidth: 1,

      borderTopColor: "#F1F5F9",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },


    slotsLabel: {
      fontSize: 5.5,

      fontWeight: "900",

      letterSpacing: 0.9,

      color: "#94A3B8",
    },


    slots: {
      marginTop: 3,

      fontSize: 8.5,

      fontWeight: "900",

      color: "#16A34A",
    },


    fullSlots: {
      color: "#DC2626",
    },


    // =======================================================
    // VIEW BUTTON
    // =======================================================

    viewButton: {
      flexDirection: "row",

      alignItems: "center",

      gap: 5,
    },


    viewButtonText: {
      fontSize: 8.5,

      fontWeight: "900",

      color: "#2563EB",
    },

  });