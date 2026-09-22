import {
  LayoutDashboard,
  Users,
  Wrench,
  UserCheck,
  GraduationCap,
  ClipboardList,
  CalendarDays,
  ClipboardCheck,
  Award,
  BookOpen,
  FileBarChart2,
  BarChart3,
  Settings,
  MessageSquareText,
} from "lucide-react";

import type { SidebarSectionType } from "./types";

export const sidebarMenu: SidebarSectionType[] = [


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



    {
    title: "SERVICE MANAGEMENT",
    items: [
      {
        title: "Services",
        icon: Wrench,
        children: [
          {
            title: "Services",
            href: "/services",
            icon: Wrench,
          },
          {
            title: "Requests",
            href: "/services/requests",
            icon: ClipboardList,
          },
          {
            title: "Consultations",
            href: "/services/consultations",
            icon: MessageSquareText,
          },
          {
            title: "Training",
            href: "/services/training",
            icon: GraduationCap,
          },
        ],
      },
    ],
  },

  {
    title: "TRAINING MANAGEMENT",
    items: [
      {
        title: "Training Management",
        icon: GraduationCap,
        children: [
          {
            title: "Users",
            href: "/user",
            icon: Users,
          },
          {
            title: "Trainer Applications",
            href: "/trainer-applications",
            icon: UserCheck,
          },
           {
            title: "Grades",
            href: "/grade",
            icon: BarChart3,
          },
          
          {
            title: "Training",
            href: "/training",
            icon: GraduationCap,
          },
          {
            title: "Enrollment",
            href: "/enrollment",
            icon: ClipboardList,
          },
          {
            title: "Attendance",
            href: "/attendance",
            icon: CalendarDays,
          },
          {
            title: "Assessment",
            href: "/assessment",
            icon: ClipboardCheck,
          },
          {
            title: "Certificates",
            href: "/certificate",
            icon: Award,
          },
          {
            title: "Learning Materials",
            href: "/learning",
            icon: BookOpen,
          },
        ],
      },
    ],
  },



  {
    title: "REPORTS",
    items: [
      {
        title: "Reports",
        icon: FileBarChart2,
        children: [
         
          {
            title: "Reports",
            href: "/report",
            icon: FileBarChart2,
          },
        ],
      },
    ],
  },



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