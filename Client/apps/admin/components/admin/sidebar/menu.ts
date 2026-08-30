import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  UserRound,
  ClipboardCheck,
  FileBarChart2,
  CalendarDays,
  Megaphone,
  Bell,
  MessageSquare,
  Settings,
  BookOpen,
  UserCheck,
} from "lucide-react";

import { SidebarSectionType } from "./types";

export const sidebarMenu: SidebarSectionType[] = [
  // =========================================================
  // MAIN
  // =========================================================

  {
    title: "MAIN",

    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  // =========================================================
  // MANAGEMENT
  // =========================================================

  {
    title: "MANAGEMENT",

    items: [
      {
        title: "User",
        href: "/user",
        icon: UserRound,
      },

      // -------------------------------------------------------
      // TRAINER APPLICATIONS
      // -------------------------------------------------------

      {
        title: "Trainer Applications",
        href: "/trainer-applications",
        icon: UserCheck,
      },

      {
        title: "Training",
        href: "/training",
        icon: Users,
      },

      {
        title: "Attendance",
        href: "/attendance",
        icon: BriefcaseBusiness,
      },

      {
        title: "Assessment",
        href: "/assessment",
        icon: BriefcaseBusiness,
      },

      {
        title: "Certificate",
        href: "/certificate",
        icon: ClipboardCheck,
      },

      {
        title: "Learning Materials",
        href: "/learning",
        icon: BookOpen,
      },

      {
        title: "Enrollment",
        href: "/enrollment",
        icon: CalendarDays,
      },
    ],
  },

  // =========================================================
  // REPORTS
  // =========================================================

  {
    title: "REPORTS",

    items: [
      {
        title: "Reports",
        href: "/report",
        icon: FileBarChart2,
      },
    ],
  },

  // =========================================================
  // COMMUNICATION
  // =========================================================

  {
    title: "COMMUNICATION",

    items: [
      {
        title: "Announcements",
        href: "/announcement",
        icon: Megaphone,
      },

      {
        title: "Notifications",
        href: "/notification",
        icon: Bell,
      },

      {
        title: "Messages",
        href: "/message",
        icon: MessageSquare,
      },
    ],
  },

  // =========================================================
  // SETTINGS
  // =========================================================

  {
    title: "SETTINGS",

    items: [
      {
        title: "Settings",
        href: "/setting",
        icon: Settings,
      },
    ],
  },
];