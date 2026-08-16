


export interface OnboardingItem {
  id: string;

  title: string;

  subtitle: string;

  image: any;

  background: [string, string];
}

export const onboardingData: OnboardingItem[] = [
  {
    id: "1",

    title: "Welcome to\nACE NEXTGEN",

    subtitle:
      "Empowering Skills. Building Futures through modern training.",

    image: require("../../assets/images/ANCILOGO.png"),

    background: [
      "#002B5C",
      "#3B7597",
    ],
  },

  {
    id: "2",

    title: "Track Your\nTraining",

    subtitle:
      "Monitor attendance, assessments, certificates and learning progress in one place.",

    image: require("../../assets/images/ANCILOGO.png"),

    background: [
      "#003B7A",
      "#6FD1D7",
    ],
  },

  {
    id: "3",

    title: "Grow &\nGet Certified",

    subtitle:
      "Complete your learning journey and unlock new opportunities.",

    image: require("../../assets/images/ANCILOGO.png"),

    background: [
      "#002B5C",
      "#6FD1D7",
    ],
  },
];