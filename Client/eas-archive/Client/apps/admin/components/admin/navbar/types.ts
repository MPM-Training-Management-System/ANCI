
import React from "react";

export interface NavbarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NavbarCollapseProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NavbarTitleProps {
  title?: string;
  subtitle?: string;
}

export interface NavbarSearchProps {
  placeholder?: string;
}

export interface NavbarNotificationProps {
  notificationCount?: number;
  messageCount?: number;
}

export interface NavbarProfileProps {
  name: string;
  role: string;
  image?: string;
}