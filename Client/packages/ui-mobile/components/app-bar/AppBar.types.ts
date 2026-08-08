import { ReactNode } from "react";

export interface AppBarProps {
  title?: string;

  subtitle?: string;

  showBackButton?: boolean;

  onBackPress?: () => void;

  left?: ReactNode;

  right?: ReactNode;
}