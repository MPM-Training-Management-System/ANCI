// import React from "react";
// import {
//   Alert,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// import Ionicons from "@expo/vector-icons/Ionicons";
// import {
//   useLocalSearchParams,
//   useRouter,
// } from "expo-router";

// type Question = {
//   id: number;
//   question: string;
//   choices: string[];
// };

// const mockQuestions: Question[] = [
//   {
//     id: 1,
//     question:
//       "What is one important quality of an effective leader?",
//     choices: [
//       "Good communication",
//       "Avoiding responsibility",
//       "Ignoring feedback",
//       "Working alone",
//     ],
//   },
//   {
//     id: 2,
//     question:
//       "Why is teamwork important in an organization?",
//     choices: [
//       "It improves collaboration",
//       "It prevents communication",
//       "It removes accountability",
//       "It creates unnecessary work",
//     ],
//   },
//   {
//     id: 3,
//     question:
//       "Which behavior demonstrates good leadership?",
//     choices: [
//       "Listening to team members",
//       "Ignoring concerns",
//       "Avoiding decisions",
//       "Blaming others",
//     ],
//   },
// ];

// export default function AssessmentScreen() {
//   const router = useRouter();

//   const params =
//     useLocalSearchParams<{
//       id?: string;
//       trainingId?: string;
//     }>();

//   const assessmentId =
//     params.id ?? "ASM-001";

//   const trainingId =
//     params.trainingId ?? "TR-001";

//   const [currentQuestion, setCurrentQuestion] =
//     React.useState(0);

//   const [answers, setAnswers] =
//     React.useState<
//       Record<number, string>
//     >({});

//   const question =
//     mockQuestions[currentQuestion];

//   const selectedAnswer =
//     answers[question.id];

//   function handleSelectAnswer(
//     answer: string
//   ) {
//     setAnswers((previous) => ({
//       ...previous,
//       [question.id]: answer,
//     }));
//   }

//   function handleNext() {
//     if (!selectedAnswer) {
//       Alert.alert(
//         "Answer Required",
//         "Please select an answer before continuing."
//       );

//       return;
//     }

//     if (
//       currentQuestion <
//       mockQuestions.length - 1
//     ) {
//       setCurrentQuestion(
//         (previous) => previous + 1
//       );

//       return;
//     }

//     Alert.alert(
//       "Assessment Complete",
//       `Mock assessment ${assessmentId} for ${trainingId} has been submitted.`,
//       [
//         {
//           text: "Done",
//           onPress: () => router.back(),
//         },
//       ]
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.content}
//       >
//         {/* BACK */}

//         <Pressable
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Ionicons
//             name="arrow-back"
//             size={20}
//             color="#0F172A"
//           />

//           <Text style={styles.backText}>
//             Back
//           </Text>
//         </Pressable>

//         {/* HEADER */}

//         <View style={styles.header}>
//           <View style={styles.headerInfo}>
//             <Text style={styles.title}>
//               Assessment
//             </Text>

//             <Text style={styles.subtitle}>
//               Leadership Training
//             </Text>

//             <Text style={styles.id}>
//               {assessmentId}
//             </Text>
//           </View>

//           <View style={styles.counter}>
//             <Text style={styles.counterText}>
//               {currentQuestion + 1}/
//               {mockQuestions.length}
//             </Text>
//           </View>
//         </View>

//         {/* PROGRESS */}

//         <View style={styles.progressTrack}>
//           <View
//             style={[
//               styles.progress,
//               {
//                 width: `${
//                   ((currentQuestion + 1) /
//                     mockQuestions.length) *
//                   100
//                 }%`,
//               },
//             ]}
//           />
//         </View>

//         {/* QUESTION */}

//         <View style={styles.questionCard}>
//           <Text style={styles.questionNumber}>
//             QUESTION {currentQuestion + 1}
//           </Text>

//           <Text style={styles.question}>
//             {question.question}
//           </Text>

//           <View style={styles.choices}>
//             {question.choices.map(
//               (choice, index) => {
//                 const selected =
//                   selectedAnswer ===
//                   choice;

//                 return (
//                   <Pressable
//                     key={choice}
//                     style={[
//                       styles.choice,
//                       selected &&
//                         styles.choiceSelected,
//                     ]}
//                     onPress={() =>
//                       handleSelectAnswer(
//                         choice
//                       )
//                     }
//                   >
//                     <View
//                       style={[
//                         styles.choiceNumber,
//                         selected &&
//                           styles.choiceNumberSelected,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.choiceNumberText,
//                           selected &&
//                             styles.choiceNumberTextSelected,
//                         ]}
//                       >
//                         {String.fromCharCode(
//                           65 + index
//                         )}
//                       </Text>
//                     </View>

//                     <Text
//                       style={[
//                         styles.choiceText,
//                         selected &&
//                           styles.choiceTextSelected,
//                       ]}
//                     >
//                       {choice}
//                     </Text>

//                     {selected && (
//                       <Ionicons
//                         name="checkmark-circle"
//                         size={20}
//                         color="#2563EB"
//                       />
//                     )}
//                   </Pressable>
//                 );
//               }
//             )}
//           </View>
//         </View>

//         {/* BUTTON */}

//         <Pressable
//           style={styles.nextButton}
//           onPress={handleNext}
//         >
//           <Text style={styles.nextButtonText}>
//             {currentQuestion ===
//             mockQuestions.length - 1
//               ? "Submit Assessment"
//               : "Next Question"}
//           </Text>

//           <Ionicons
//             name={
//               currentQuestion ===
//               mockQuestions.length - 1
//                 ? "checkmark"
//                 : "arrow-forward"
//             }
//             size={18}
//             color="#FFFFFF"
//           />
//         </Pressable>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },

//   content: {
//     paddingHorizontal: 20,
//     paddingTop: 55,
//     paddingBottom: 40,
//   },

//   backButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     marginBottom: 22,
//   },

//   backText: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#0F172A",
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   headerInfo: {
//     flex: 1,
//   },

//   title: {
//     fontSize: 25,
//     fontWeight: "800",
//     color: "#0F172A",
//   },

//   subtitle: {
//     fontSize: 11,
//     color: "#64748B",
//     marginTop: 4,
//   },

//   id: {
//     fontSize: 8,
//     color: "#94A3B8",
//     marginTop: 3,
//   },

//   counter: {
//     backgroundColor: "#EFF6FF",
//     borderRadius: 9,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//   },

//   counterText: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#2563EB",
//   },

//   progressTrack: {
//     height: 6,
//     backgroundColor: "#E2E8F0",
//     borderRadius: 3,
//     overflow: "hidden",
//     marginTop: 18,
//     marginBottom: 22,
//   },

//   progress: {
//     height: "100%",
//     backgroundColor: "#2563EB",
//   },

//   questionCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 21,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },

//   questionNumber: {
//     fontSize: 8,
//     fontWeight: "800",
//     letterSpacing: 1,
//     color: "#2563EB",
//   },

//   question: {
//     fontSize: 17,
//     lineHeight: 25,
//     fontWeight: "800",
//     color: "#0F172A",
//     marginTop: 9,
//     marginBottom: 22,
//   },

//   choices: {
//     gap: 10,
//   },

//   choice: {
//     minHeight: 55,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     paddingHorizontal: 11,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   choiceSelected: {
//     borderColor: "#93C5FD",
//     backgroundColor: "#EFF6FF",
//   },

//   choiceNumber: {
//     width: 31,
//     height: 31,
//     borderRadius: 10,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   choiceNumberSelected: {
//     backgroundColor: "#2563EB",
//   },

//   choiceNumberText: {
//     fontSize: 10,
//     fontWeight: "800",
//     color: "#64748B",
//   },

//   choiceNumberTextSelected: {
//     color: "#FFFFFF",
//   },

//   choiceText: {
//     flex: 1,
//     fontSize: 10,
//     color: "#334155",
//     fontWeight: "600",
//   },

//   choiceTextSelected: {
//     color: "#1E3A8A",
//     fontWeight: "800",
//   },

//   nextButton: {
//     height: 53,
//     borderRadius: 15,
//     backgroundColor: "#2563EB",
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 20,
//   },

//   nextButtonText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "800",
//   },
// });