export type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: any;
};

export const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to ANCI",
    description:
      "Manage players, tournaments, coaches and events in one powerful application.",
    image: require("@/assets/onboarding/anci.png"),
  },
  {
    id: "2",
    title: "Track Performance",
    description:
      "Monitor rankings, player statistics and qualification progress in real time.",
    image: require("@/assets/onboarding/track.png"),
  },
  {
    id: "3",
    title: "Let's Get Started",
    description:
      "Create an account or sign in to continue your Roll Ball journey.",
    image: require("@/assets/images/ANCILOGO.png"),
  },
];