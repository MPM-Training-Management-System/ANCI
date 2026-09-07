import React from "react";

export interface NavbarProps {
  // Desktop sidebar state
  collapsed: boolean;

  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  // Mobile sidebar state
  mobileOpen: boolean;

  setMobileOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

export interface NavbarCollapseProps {
  collapsed: boolean;

  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
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