import { useMemo, useState } from "react";
import { Image } from "react-native";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Button,
  Stepper,
} from "@repo/ui-mobile";

import PersonalInformationStep from "./register/PersonalInformationStep";
import ContactInformationStep from "./register/ContactInformationStep";
import EmergencyContactStep from "./register/EmergencyContactStep";
import TrainingInformationStep from "./register/TrainingInformationStep";
import EducationStep from "./register/EducationStep";
import EmploymentExperienceStep from "./register/EmploymentExperienceStep";
import RequirementsStep from "./register/RequirementsStep";
import AccountStep from "./register/AccountStep";

export default function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const totalSteps = 8;

  const next = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const previous = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep(step - 1);
  };

  const currentStep = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: "Personal Information",
          subtitle:
            "Tell us more about yourself.",
        };

      case 2:
        return {
          title: "Contact Information",
          subtitle:
            "How can we contact you?",
        };

      case 3:
        return {
          title: "Emergency Contact",
          subtitle:
            "Who should we contact during emergencies?",
        };

      case 4:
        return {
          title: "Training Information",
          subtitle:
            "Select your preferred training.",
        };

      case 5:
        return {
          title: "Educational Background",
          subtitle:
            "Tell us about your education.",
        };

      case 6:
        return {
          title: "Employment & Experience",
          subtitle:
            "Share your work experience.",
        };

      case 7:
        return {
          title: "Requirements",
          subtitle:
            "Upload your required documents.",
        };

      case 8:
        return {
          title: "Account Information",
          subtitle:
            "Create your account credentials.",
        };

      default:
        return {
          title: "",
          subtitle: "",
        };
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalInformationStep />;

      case 2:
        return <ContactInformationStep />;

      case 3:
        return <EmergencyContactStep />;

      case 4:
        return <TrainingInformationStep />;

      case 5:
        return <EducationStep />;

      case 6:
        return <EmploymentExperienceStep />;

      case 7:
        return <RequirementsStep />;

      case 8:
        return <AccountStep />;

      default:
        return null;
    }
  };
    return (
    <SafeAreaView style={styles.container}>
    <View style={styles.header}>
  <Image
    source={require("@/assets/auth/login.webp")}
    style={styles.headerImage}
    resizeMode="cover"
  />
</View>
        {/* BACK */}

      <View style={styles.topBar}>
  <Pressable
    onPress={previous}
    style={styles.backButton}
  >
    <Ionicons
      name="arrow-back"
      size={22}
      color="#fff"
    />
  </Pressable>
</View>

        {/* TITLE */}

        
        {/* PROGRESS */}

       
    

      {/* CONTENT */}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
  <Text style={styles.cardTitle}>
    Create Account
  </Text>

  <Text style={styles.cardSubtitle}>
    Join our training program and complete your registration.
  </Text>
</View>
         <Stepper
          currentStep={step}
          totalSteps={totalSteps}
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          containerStyle={{
            marginTop: 24,
            backgroundColor: "transparent",
          }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 30,
          }}
        >
          {renderStep()}
        </ScrollView>
      </View>

      {/* FOOTER */}

      <View style={styles.footer}>
        {step > 1 && (
          <Button
            variant="outline"
            style={styles.previousButton}
            onPress={previous}
          >
            Previous
          </Button>
        )}

        <Button
          style={[
            styles.nextButton,
            step === 1 && {
              marginLeft: 0,
            },
          ]}
          onPress={next}
        >
          {step === totalSteps
            ? "Create Account"
            : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
  height: 260,
  overflow: "hidden",
},

headerImage: {
  width: "100%",
  height: "100%",
},

topBar: {
  position: "absolute",
  top: 55,
  left: 20,
  zIndex: 10,
},

backButton: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "rgba(0,0,0,.35)",

  justifyContent: "center",
  alignItems: "center",
},

card: {
  flex: 1,

  marginTop: -100,

  backgroundColor: "#FFF",

  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,

  paddingHorizontal: 22,
  paddingTop: 12,
},

  footer: {
    flexDirection: "row",

    paddingHorizontal: 20,

    paddingVertical: 18,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,

    borderTopColor: "#E2E8F0",
  },

  previousButton: {
    flex: 1,

    marginRight: 10,

    borderRadius: 16,
  },

  nextButton: {
    flex: 1,

    marginLeft: 10,

    borderRadius: 16,
  },
  cardHeader: {
  marginBottom: 0,
},

cardTitle: {
  fontSize: 28,
  fontWeight: "700",
  color: "#0F172A",
},

cardSubtitle: {
  marginTop: 6,
  fontSize: 15,
  lineHeight: 22,
  color: "#64748B",
},
});